import mongoose from "mongoose";
import { Subject } from "./subject.model.js";
import { School } from "./school.model.js";
import { Duty } from "./duty.model.js";
import Organization from "./authModels/organization.model.js";
import { User } from "./authModels/User.js";
import bcrypt from "bcrypt";

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
    organization: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true }
);

// Post-save middleware to create end user
TeacherSchema.post("save", async function (doc) {
  try {
    // Create email from name
    const email = `${doc.name.toLowerCase().replace(/\s+/g, ".")}@school.com`;

    // Hash the temporary password
    const hashedPassword = await bcrypt.hash(doc.name, 10);

    // Create the end user
    const newUser = new User({
      name: doc.name,
      email: email,
      password: hashedPassword,
      role: "endUser",
      organizationId: doc.organization,
      teacherId: doc._id,
      passwordChangeRequired: true, // Add this field to User schema
    });

    await newUser.save();
  } catch (error) {
    console.error("Error creating end user for teacher:", error);
  }
});

export const Teacher = mongoose.model("Teacher", TeacherSchema);
