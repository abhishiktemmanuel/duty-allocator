import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a new subject
const registerSubject = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name) {
    throw new ApiError(400, "Subject name is required");
  }

  // Use dynamically compiled Subject model from req.models
  const Subject = req.models.Subject;

  // Check if subject already exists
  const subjectExists = await Subject.findOne({ name });
  if (subjectExists) {
    throw new ApiError(409, "Subject already exists");
  }

  // Create new subject
  const subject = await Subject.create({ name });

  // Return success response with new subject data
  return res.status(201).json({
    status: "success",
    data: {
      _id: subject._id,
      name: subject.name,
    },
    message: "Subject added successfully",
  });
});

// Function to get all subjects
const getAllSubjects = asyncHandler(async (req, res) => {
  // Use dynamically compiled Subject model from req.models
  const Subject = req.models.Subject;

  const subjects = await Subject.find({});
  if (!subjects || subjects.length === 0) {
    throw new ApiError(404, "No subjects found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subjects, "Subjects retrieved successfully"));
});

export { registerSubject, getAllSubjects };
