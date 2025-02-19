import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      sparse: true,
      validate: {
        validator: function (v) {
          return !v || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`,
      },
      required: function () {
        return this.role !== "endUser"; // Required for roles other than endUser
      },
    },
    password: {
      type: String,
      required: function () {
        return this.externalAccounts.length === 0 && this.role !== "endUser";
      },
    },
    role: {
      type: String,
      enum: ["superAdmin", "admin", "endUser"],
      required: true,
    },
    verified: { type: Boolean, default: false },
    verificationToken: String,
    verificationExpires: Date,
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
          required: true,
        },
        teacherId: {
          type: mongoose.Schema.Types.ObjectId,
          required: function () {
            return this.role === "endUser";
          },
        },
        status: {
          type: String,
          enum: ["Active", "Inactive", "Pending"],
          default: "Pending",
        },
        joinedAt: Date,
        invitedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    mergeRequests: [
      {
        token: String,
        organizationId: mongoose.Schema.Types.ObjectId,
        teacherId: mongoose.Schema.Types.ObjectId,
        expires: Date,
      },
    ],
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

export const User = mongoose.model("User", UserSchema);
