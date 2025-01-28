import mongoose from "mongoose";

const dutySchema = new mongoose.Schema(
  {
    date: {
      type: Date,
      required: true,
    },
    shift: {
      type: String,
      required: true,
      enum: ["Morning", "Evening"],
    },
    invidulator1: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: function () {
        return this.status === "ASSIGNED";
      },
    },
    invidulator2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: function () {
        return this.status === "ASSIGNED";
      },
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },
    room: {
      type: String,
      required: true,
    },
    standard: {
      type: String,
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "UNASSIGNED", "CONFLICT"],
      default: "ASSIGNED",
      required: true,
    },
  },
  { timestamps: true }
);

// Add a pre-save middleware to ensure status consistency
dutySchema.pre("save", function (next) {
  if (!this.invidulator1 || !this.invidulator2) {
    this.status = "UNASSIGNED";
  }
  next();
});

// Add validation to ensure both invigilators are present for ASSIGNED status
dutySchema.pre("validate", function (next) {
  if (
    this.status === "ASSIGNED" &&
    (!this.invidulator1 || !this.invidulator2)
  ) {
    next(new Error("Both invigilators are required for ASSIGNED status"));
  }
  next();
});

export const Duty = mongoose.model("Duty", dutySchema);
