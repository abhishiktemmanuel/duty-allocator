import { asyncHandler } from "../utils/asyncHandler.js";
import { Subject } from "../models/subject.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerSubject = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  const subjectExists = await Subject.findOne({ name });
  if (subjectExists) {
    throw new ApiError(409, "Subject already exists");
  }
  const subject = await Subject.create({ name });
  const newSubjectData = await Subject.findById(subject._id);
  if (!newSubjectData) {
    throw new ApiError(500, "Something went wrong while adding subject data");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, newSubjectData, "Subject added successfully"));
});

// Function to get all subjects
const getAllSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({});
  if (!subjects || subjects.length === 0) {
    throw new ApiError(404, "No subjects found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, subjects, "Subjects retrieved successfully"));
});

export { registerSubject, getAllSubjects };
