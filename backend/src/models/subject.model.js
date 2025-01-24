import mongoose from "mongoose";
const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
  },
});

export const Subject = mongoose.model("Subject", SubjectSchema);
