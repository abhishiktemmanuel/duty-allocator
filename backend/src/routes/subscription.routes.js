import { Router } from "express";
import {
  createSubscription,
  getSubscriptionStatus,
  razorpayWebhookHandler,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = Router();

router.post("/create", authMiddleware, createSubscription); // Create a new subscription
router.get("/status", authMiddleware, getSubscriptionStatus); // Get current subscription status
router.post("/webhook", razorpayWebhookHandler); // Handle Razorpay webhook events
router.post("/cancel", authMiddleware, cancelSubscription);

export default router;
