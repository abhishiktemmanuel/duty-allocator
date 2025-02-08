import razorpay from "../services/razorpayService.js";
import Subscription from "../models/subscription.model.js";
import crypto from "crypto";

// Helper function to calculate end date based on subscription type
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

// Helper function to determine total count based on subscription type
const getTotalCount = (type) => {
  switch (type) {
    case "monthly":
      return 12; // 12 monthly payments for a year
    case "quarterly":
      return 4; // 4 quarterly payments for a year
    case "yearly":
      return 1; // 1 yearly payment
    default:
      throw new Error("Invalid subscription type");
  }
};

// Create a new subscription
export async function createSubscription(req, res) {
  try {
    const { planId, subscriptionType } = req.body;
    const userId = req.user.id;

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

    // Save subscription details to the database
    const newSubscription = await Subscription.create({
      userId,
      razorpaySubscriptionId: subscription.id,
      planId,
      status: "active",
      type: subscriptionType,
      startDate: new Date(),
      endDate: calculateEndDate(subscriptionType),
    });

    res.status(201).json({ success: true, data: newSubscription });
  } catch (error) {
    console.error("Error creating subscription:", error);
    res.status(500).json({ success: false, error: error.message });
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

// Handle Razorpay webhook events
export const razorpayWebhookHandler = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      return res.status(403).json({ message: "Invalid signature" });
    }

    console.log("Webhook verified");

    // Process the webhook event
    const event = req.body.event;

    switch (event) {
      case "subscription.charged":
        // Update the corresponding subscription in the database
        const { id } = req.body.payload.subscription.entity;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: id },
          { status: "active" }
        );
        break;

      case "subscription.cancelled":
        // Mark subscription as cancelled in the database
        const cancelledId = req.body.payload.subscription.entity.id;
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: cancelledId },
          { status: "cancelled" }
        );
        break;

      // Add more cases as needed

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
    await razorpay.subscriptions.cancel(subscription.razorpaySubscriptionId);

    // Update subscription status in database
    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.status(200).json({ message: "Subscription cancelled successfully" });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error cancelling subscription", error: error.message });
  }
};
