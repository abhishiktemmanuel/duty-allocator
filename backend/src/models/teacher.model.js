import mongoose from "mongoose";
import { Subject } from "./subject.model.js";
import { School } from "./school.model.js";
import { Duty } from "./duty.model.js";
const TeacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
      unique: true,
    },
    subjects: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Subject",
        required: true,
      },
    ],
    school: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "School",
      required: true,
    },
    duties: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Duty",
      },
    ],
  },
  { timestamps: true }
);
export const Teacher = mongoose.model("Teacher", TeacherSchema);
