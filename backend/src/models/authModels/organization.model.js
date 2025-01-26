import mongoose from "mongoose";

const { Schema } = mongoose;

// Stores metadata and references for each organization
const organizationSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    adminId: {
      type: Schema.Types.ObjectId,
      ref: "User", // Reference to the User model (admin who created the organization)
      required: false,
    },
  },
  { timestamps: true }
);

const Organization = mongoose.model("Organization", organizationSchema);

export default Organization;
