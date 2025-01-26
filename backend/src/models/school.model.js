import mongoose from "mongoose";
const SchoolSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    index: true,
  },
});
export const School = mongoose.model("School", SchoolSchema);
