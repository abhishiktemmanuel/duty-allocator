// models/Teacher.js
import mongoose from "mongoose";
import { User } from "./authModels/User.js";
import bcrypt from "bcrypt";

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
  },
  { timestamps: true }
);

// Post-save middleware to create or update end user
TeacherSchema.post("save", async function (doc) {
  try {
    const email = `${doc.name.toLowerCase().replace(/\s+/g, ".")}@school.com`;
    const hashedPassword = await bcrypt.hash(doc.name, 10);

    const existingUser = await User.findOne({ email: email });

    if (existingUser) {
      // Update existing user
      existingUser.organizations.push({
        organizationId: doc.organization,
        teacherId: doc._id,
        status: "Active",
      });
      await existingUser.save();
    } else {
      // Create new user
      const newUser = new User({
        name: doc.name,
        email: email,
        password: hashedPassword,
        role: "endUser",
        passwordChangeRequired: true,
        organizations: [
          {
            organizationId: doc.organization,
            teacherId: doc._id,
            status: "Active",
          },
        ],
      });
      await newUser.save();
    }
  } catch (error) {
    console.error("Error creating/updating end user for teacher:", error);
  }
});

export const Teacher = mongoose.model("Teacher", TeacherSchema);
