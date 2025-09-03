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
    customerId: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      enum: ["created", "active", "cancelled", "paused"],
      default: "created",
    },
    subscriptionType: {
      type: Number,
      default: null,
    },
    currentStart: {
      type: Date,
      default: null,
    },
    currentEnd: {
      type: Date,
      default: null,
    },
    startAt: {
      type: Date,
      default: null,
    },
    endAt: {
      type: Date,
      default: null,
    },
    chargeAt: {
      type: Date,
      default: null,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    totalCount: {
      type: Number,
      default: null,
    },
    paidCount: {
      type: Number,
      default: 0,
    },
    remainingCount: {
      type: Number,
      default: null,
    },
    customerNotify: {
      type: Boolean,
      default: true,
    },
    notes: {
      type: Map,
      of: String,
      default: null,
    },
    offerId: {
      type: String,
      default: null,
    },
    hasScheduledChanges: {
      type: Boolean,
      default: false,
    },
    changeScheduledAt: {
      type: Date,
      default: null,
    },
    source: {
      type: String,
      default: null,
    },
    paymentDetails: {
      type: {
        paymentId: String,
        orderId: String,
        invoiceId: String,
        amount: Number,
        currency: String,
        method: String,
        status: String,
        cardId: String,
        cardDetails: {
          last4: String,
          network: String,
          type: String,
          issuer: String,
          international: Boolean,
          expiry_month: Number,
          expiry_year: Number,
        },
      },
      default: null,
    },
    cancelledAt: {
      type: Date,
      default: null,
    },
    pausedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        // Add any virtual fields or transformations here
        if (ret.currentEnd) {
          ret.daysRemaining = Math.ceil(
            (new Date(ret.currentEnd) - new Date()) / (1000 * 60 * 60 * 24)
          );
        }
        return ret;
      },
    },
  }
);

// Indexes for better query performance
SubscriptionSchema.index({ userId: 1, status: 1 });
SubscriptionSchema.index({ razorpaySubscriptionId: 1 });
SubscriptionSchema.index({ customerId: 1 });

// Virtual for subscription status
SubscriptionSchema.virtual("isActive").get(function () {
  return this.status === "active";
});

// Methods
SubscriptionSchema.methods.isExpired = function () {
  if (!this.currentEnd) return false;
  return new Date() > this.currentEnd;
};

SubscriptionSchema.methods.getRemainingDays = function () {
  if (!this.currentEnd) return null;
  return Math.ceil((this.currentEnd - new Date()) / (1000 * 60 * 60 * 24));
};

// Static methods
SubscriptionSchema.statics.findActiveSubscription = function (userId) {
  return this.findOne({
    userId,
    status: "active",
    // currentEnd: { $gt: new Date() },
  });
};

// Pre-save middleware
SubscriptionSchema.pre("save", function (next) {
  // Any pre-save operations can go here
  next();
});

const Subscription = mongoose.model("Subscription", SubscriptionSchema);

export default Subscription;
