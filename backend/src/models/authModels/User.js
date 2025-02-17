import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, unique: true, sparse: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "endUser"],
      required: true,
    },
    passwordChangeRequired: { type: Boolean, default: false },
    phoneNumber: { type: String, unique: true, sparse: true },
    externalAccounts: [
      {
        provider: { type: String, enum: ["Google", "Microsoft"] },
        externalId: { type: String },
      },
    ],
    organizations: [
      {
        organizationId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Organization",
        },
        teacherId: { type: mongoose.Schema.Types.ObjectId, ref: "Teacher" },
        status: {
          type: String,
          enum: ["Active", "Inactive"],
          default: "Active",
        },
      },
    ],
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
