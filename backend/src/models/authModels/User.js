// models/User.js
import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ["superAdmin", "admin", "endUser"],
    required: true,
  },
  organizationId: { type: mongoose.Schema.Types.ObjectId, ref: "Organization" },
  passwordChangeRequired: { type: Boolean, default: false },
});

export const User = mongoose.model("User", UserSchema);
