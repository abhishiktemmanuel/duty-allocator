// models/UserModels.js

import mongoose from "mongoose";

const { Schema } = mongoose;

// Base schema shared by all user types
const baseUserSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
  },
  {
    discriminatorKey: "role", // Stores the role type in the "role" field
    collection: "users", // All roles go to the same 'users' collection
  },
  { timestamps: true }
);

// The "User" model from which we create discriminators
const User = mongoose.model("User", baseUserSchema);

// Extra fields for superAdmin
const superAdminSchema = new Schema({
  globalPrivileges: {
    type: [String],
    default: [],
  },
});

// Extra fields for admin
const adminSchema = new Schema({
  organizationId: {
    type: Schema.Types.ObjectId,
    ref: "Organization",
  },
  permissions: {
    type: [String],
    default: [],
  },
});

// Extra fields for endUser
const endUserSchema = new Schema({
  profileInfo: {
    type: String,
    default: "",
  },
});

// Create discriminators for each user role
const SuperAdmin = User.discriminator("superAdmin", superAdminSchema);
const Admin = User.discriminator("admin", adminSchema);
const EndUser = User.discriminator("endUser", endUserSchema);

export { SuperAdmin, Admin, EndUser };
