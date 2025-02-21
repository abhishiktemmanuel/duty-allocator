import mongoose from "mongoose";
const SubjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    trim: true,
    index: true,
  },
});

export const Subject = mongoose.model("Subject", SubjectSchema);
