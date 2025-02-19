// models/Teacher.js
import mongoose from "mongoose";
import { User } from "./authModels/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const TeacherSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      uppercase: true,
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
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    globalUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// Post-save middleware to create or update end user
TeacherSchema.post("save", async function (doc) {
  try {
    // Create merge token
    const mergeToken = jwt.sign(
      {
        teacherId: doc._id,
        organizationId: doc.organization,
        globalUserId: doc.globalUserId,
      },
      process.env.JWT_SECRET,
      { expiresIn: "70d" }
    );
    // Create/update global user stub
    await User.findByIdAndUpdate(
      doc.globalUserId,
      {
        $push: {
          organizations: {
            organizationId: doc.organization,
            teacherId: doc._id,
            status: "Pending",
            joinedAt: new Date(),
          },
          mergeRequests: {
            token: mergeToken,
            organizationId: doc.organization,
            teacherId: doc._id,
            expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          },
        },
      },
      { upsert: true, new: true }
    );
  } catch (error) {
    console.error("Error handling teacher creation:", error);
  }
});

export const Teacher = mongoose.model("Teacher", TeacherSchema);
