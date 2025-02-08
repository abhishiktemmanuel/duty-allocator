import mongoose from "mongoose";

const SubscriptionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    razorpaySubscriptionId: {
      type: String,
      required: true,
    },
    planId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "cancelled"],
      default: "inactive",
    },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model("Subscription", SubscriptionSchema);
