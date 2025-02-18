import razorpay from "../services/razorpayService.js";
import Subscription from "../models/subscription.model.js";
import crypto from "crypto";

const calculateEndDate = (type) => {
  const now = new Date();
  switch (type) {
    case "monthly":
      return new Date(now.setMonth(now.getMonth() + 1));
    case "quarterly":
      return new Date(now.setMonth(now.getMonth() + 3));
    case "yearly":
      return new Date(now.setFullYear(now.getFullYear() + 1));
    default:
      throw new Error("Invalid subscription type");
  }
};

const getTotalCount = (type) => {
  switch (type) {
    case "monthly":
      return 120;
    case "quarterly":
      return 40;
    case "yearly":
      return 10;
    default:
      throw new Error("Invalid subscription type");
  }
};

export async function createSubscription(req, res) {
  try {
    const { planId } = req.body;
    const userId = req.user.id;

    // Check if user already has an active subscription
    const existingSubscription = await Subscription.findOne({
      userId,
      status: "active",
    });
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: "User already has an active subscription",
      });
    }

    // Fetch plan details from Razorpay
    const plan = await razorpay.plans.fetch(planId);
    const subscriptionType = plan.period.toLowerCase();

    if (!["monthly", "quarterly", "yearly"].includes(subscriptionType)) {
      return res
        .status(400)
        .json({ success: false, error: "Invalid subscription type" });
    }

    // Create Razorpay subscription
    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: getTotalCount(subscriptionType),
    });

    // Save subscription details to the database with initial status as 'created'
    const newSubscription = await Subscription.create({
      userId,
      razorpaySubscriptionId: subscription.id,
      planId,
      status: "created", // Initial status
      type: subscriptionType,
      startDate: null, // Will be set when payment is confirmed
      endDate: null, // Will be set when payment is confirmed
    });

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: newSubscription._id,
        razorpaySubscriptionId: subscription.id,
      },
    });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ success: false, error: "Internal server error" });
  }
}

// Get the current subscription status
export async function getSubscriptionStatus(req, res) {
  try {
    const userId = req.user ? req.user.id : req.id;
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    const result = {
      success: true,
      hasActiveSubscription: !!subscription,
      data: subscription
        ? {
            ...subscription.toObject(),
            remainingDays: Math.ceil(
              (subscription.endDate - new Date()) / (1000 * 60 * 60 * 24)
            ),
          }
        : null,
      message: subscription ? null : "No active subscription found",
    };

    if (res) {
      // If res is provided, it's being used as a route handler
      res.status(200).json(result);
    } else {
      // If res is not provided, it's being used as a regular function
      return result;
    }
  } catch (error) {
    console.error("Error fetching subscription status:", error);
    if (res) {
      res.status(500).json({ success: false, error: error.message });
    } else {
      throw error;
    }
  }
}

export const razorpayWebhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      console.error("Webhook signature verification failed");
      return res.status(403).json({ message: "Invalid signature" });
    }

    const event = req.body.event;
    const payload = req.body.payload;
    const subscriptionId = req.body.payload.subscription.entity.id;

    switch (event) {
      case "subscription.authenticated":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          {
            status: "active",
          }
        );
        break;

      case "subscription.charged":
        const subscriptionEntity = payload.subscription.entity;
        const startDate = new Date(subscriptionEntity.start_at * 1000);
        const endDate = new Date(subscriptionEntity.end_at * 1000);
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          {
            status: "active",
            startDate,
            endDate,
          },
          { new: true, upsert: false }
        );
        break;

      case "subscription.cancelled":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          { status: "cancelled", cancelledAt: new Date() }
        );
        break;

      case "subscription.paused":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          { status: "paused" }
        );
        break;

      case "subscription.resumed":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          { status: "active" }
        );
        break;

      default:
        console.log(`Unhandled event type: ${event}`);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({ error: "Webhook processing failed" });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Subscription.findOne({
      userId,
      status: "active",
    });

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    // Cancel subscription in Razorpay
    const razorpayResponse = await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId
    );

    if (razorpayResponse.status !== "cancelled") {
      console.error(
        `Failed to cancel subscription in Razorpay: ${JSON.stringify(razorpayResponse)}`
      );
      return res
        .status(500)
        .json({ message: "Failed to cancel subscription in payment gateway" });
    }

    // Update subscription status in database
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();

    console.log(`Subscription cancelled successfully for user ${userId}`);
    res.status(200).json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    console.error(`Error cancelling subscription: ${error.message}`);
    if (error.name === "RazorpayError") {
      res
        .status(400)
        .json({ message: "Error with payment gateway", error: error.message });
    } else {
      res.status(500).json({
        message: "Error cancelling subscription",
        error: error.message,
      });
    }
  }
};
