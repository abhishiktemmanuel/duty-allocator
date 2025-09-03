import razorpay from "../services/razorpayService.js";
import Subscription from "../models/subscription.model.js";
import crypto from "crypto";

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

    const existingSubscription =
      await Subscription.findActiveSubscription(userId);
    if (existingSubscription) {
      return res.status(400).json({
        success: false,
        error: "User already has an active subscription",
      });
    }

    const plan = await razorpay.plans.fetch(planId);
    const subscriptionType = plan.period.toLowerCase();

    if (!["monthly", "quarterly", "yearly"].includes(subscriptionType)) {
      return res.status(400).json({
        success: false,
        error: "Invalid subscription type",
      });
    }

    const subscription = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_notify: 1,
      total_count: getTotalCount(subscriptionType),
    });

    const newSubscription = await Subscription.create({
      userId,
      razorpaySubscriptionId: subscription.id,
      planId,
      customerId: subscription.customer_id || null,
      status: "active",
      subscriptionType: subscription.type || null,
      totalCount: subscription.total_count || null,
      remainingCount: subscription.remaining_count || null,
      customerNotify: subscription.customer_notify ?? true,
      source: subscription.source || "api",
      notes: subscription.notes || null,
      startAt: subscription.start_at
        ? new Date(subscription.start_at * 1000)
        : null,
      endAt: subscription.end_at ? new Date(subscription.end_at * 1000) : null,
      chargeAt: subscription.charge_at
        ? new Date(subscription.charge_at * 1000)
        : null,
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
    res.status(500).json({
      success: false,
      error: error.message || "Internal server error",
    });
  }
}

export async function getSubscriptionStatus(req, res) {
  try {
    const userId = req.user?.id || req.id;
    const subscription = await Subscription.findActiveSubscription(userId);

    const result = {
      success: true,
      hasActiveSubscription: !!subscription,
      data: subscription
        ? {
            ...subscription.toJSON(),
            daysRemaining: subscription.getRemainingDays(),
          }
        : null,
      message: subscription ? null : "No active subscription found",
    };

    console.log("Subscription status for user:", userId, result);

    return res ? res.status(200).json(result) : result;
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
    // Verify webhook signature using raw request body
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const shasum = crypto.createHmac("sha256", secret);

    // Get raw body and verify signature
    const rawBody = req.body.toString();
    shasum.update(rawBody);
    const digest = shasum.digest("hex");

    if (digest !== req.headers["x-razorpay-signature"]) {
      console.error("Webhook signature verification failed");
      return res.status(403).json({ message: "Invalid signature" });
    }

    // Parse raw body to JSON
    const webhookData = JSON.parse(rawBody);
    const { event, payload } = webhookData;

    // Validate event structure
    if (!event || !payload) {
      return res
        .status(400)
        .json({ error: "Invalid webhook payload structure" });
    }

    // Handle only subscription events
    if (!event.startsWith("subscription.")) {
      console.log(`Ignoring non-subscription event: ${event}`);
      return res.status(200).json({ received: true });
    }

    // Validate subscription entity existence
    if (!payload?.subscription?.entity) {
      console.error("Invalid subscription payload structure");
      return res.status(400).json({ error: "Invalid subscription payload" });
    }

    const subscriptionEntity = payload.subscription.entity;
    const subscriptionId = subscriptionEntity.id;

    // Safely prepare payment details
    const paymentDetails = payload.payment?.entity
      ? {
          paymentId: payload.payment.entity.id,
          orderId: payload.payment.entity.order_id,
          invoiceId: payload.payment.entity.invoice_id,
          amount: payload.payment.entity.amount,
          currency: payload.payment.entity.currency,
          method: payload.payment.entity.method,
          status: payload.payment.entity.status,
          cardId: payload.payment.entity.card_id,
          cardDetails: payload.payment.entity.card
            ? {
                last4: payload.payment.entity.card.last4,
                network: payload.payment.entity.card.network,
                type: payload.payment.entity.card.type,
                issuer: payload.payment.entity.card.issuer,
                international: payload.payment.entity.card.international,
                expiry_month: payload.payment.entity.card.expiry_month,
                expiry_year: payload.payment.entity.card.expiry_year,
              }
            : null,
        }
      : null;

    // Prepare update data with null checks
    const updateData = {
      currentStart: subscriptionEntity.current_start
        ? new Date(subscriptionEntity.current_start * 1000)
        : null,
      currentEnd: subscriptionEntity.current_end
        ? new Date(subscriptionEntity.current_end * 1000)
        : null,
      startAt: subscriptionEntity.start_at
        ? new Date(subscriptionEntity.start_at * 1000)
        : null,
      endAt: subscriptionEntity.end_at
        ? new Date(subscriptionEntity.end_at * 1000)
        : null,
      chargeAt: subscriptionEntity.charge_at
        ? new Date(subscriptionEntity.charge_at * 1000)
        : null,
      quantity: subscriptionEntity.quantity || 1,
      totalCount: subscriptionEntity.total_count || null,
      paidCount: subscriptionEntity.paid_count || 0,
      remainingCount: subscriptionEntity.remaining_count || null,
      notes: subscriptionEntity.notes || null,
      offerId: subscriptionEntity.offer_id || null,
      hasScheduledChanges: Boolean(subscriptionEntity.has_scheduled_changes),
      changeScheduledAt: subscriptionEntity.change_scheduled_at
        ? new Date(subscriptionEntity.change_scheduled_at * 1000)
        : null,
    };

    // Handle different subscription events
    switch (event) {
      case "subscription.authenticated":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          { status: "active", ...updateData },
          { upsert: true }
        );
        break;

      case "subscription.charged":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          {
            status: "active",
            paymentDetails,
            ...updateData,
            $inc: { paidCount: 1 },
          },
          { new: true }
        );
        break;

      case "subscription.cancelled":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          {
            status: "cancelled",
            cancelledAt: new Date(),
            ...updateData,
          }
        );
        break;

      case "subscription.paused":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          {
            status: "paused",
            pausedAt: new Date(),
            ...updateData,
          }
        );
        break;

      case "subscription.resumed":
        await Subscription.findOneAndUpdate(
          { razorpaySubscriptionId: subscriptionId },
          {
            status: "active",
            pausedAt: null,
            ...updateData,
          }
        );
        break;

      default:
        console.warn(`Unhandled subscription event type: ${event}`);
        break;
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error("Webhook processing error:", error);
    res.status(500).json({
      error: "Internal server error",
      message: error.message,
      stack: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

export const cancelSubscription = async (req, res) => {
  try {
    const userId = req.user.id;
    const subscription = await Subscription.findActiveSubscription(userId);

    if (!subscription) {
      return res.status(404).json({ message: "No active subscription found" });
    }

    const razorpayResponse = await razorpay.subscriptions.cancel(
      subscription.razorpaySubscriptionId
    );

    if (razorpayResponse.status !== "cancelled") {
      throw new Error("Failed to cancel subscription in payment gateway");
    }

    subscription.status = "cancelled";
    subscription.cancelledAt = new Date();
    await subscription.save();

    res.status(200).json({
      success: true,
      message: "Subscription cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling subscription:", error);
    res.status(error.name === "RazorpayError" ? 400 : 500).json({
      success: false,
      message:
        error.name === "RazorpayError"
          ? "Error with payment gateway"
          : "Error cancelling subscription",
      error: error.message,
    });
  }
};
