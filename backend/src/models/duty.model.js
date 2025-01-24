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
      required: true,
    },
    invidulator2: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Teacher",
      required: true,
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
  },
  { timestamps: true }
);
export const Duty = mongoose.model("Duty", dutySchema);
