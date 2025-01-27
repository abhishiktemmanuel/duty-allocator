import mongoose from "mongoose";
import { Subject } from "./subject.model.js";
const examScheduleSchema = new mongoose.Schema(
  {
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: Subject,
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    shift: {
      type: String,
      required: true,
      enum: ["Morning", "Evening"],
    },
    rooms: [
      {
        type: String,
        required: true,
      },
    ],
    standard: {
      type: String,
    },
  },
  { timestamps: true }
);
export const ExamSchedule = mongoose.model("ExamSchedule", examScheduleSchema);
