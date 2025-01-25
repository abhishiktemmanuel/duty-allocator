import { asyncHandler } from "../utils/asyncHandler.js";
import { School } from "../models/school.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerSchool = asyncHandler(async (req, res) => {
  const { name } = req.body;

  // Validate input
  if (!name) {
    throw new ApiError(400, "School name is required");
  }

  // Check if school already exists
  const schoolExists = await School.findOne({ name });
  if (schoolExists) {
    throw new ApiError(409, "School already exists");
  }

  // Create new school
  const school = await School.create({ name });

  // Return success response with new school data
  return res.status(201).json({
    status: "success",
    data: {
      _id: school._id,
      name: school.name,
    },
    message: "School added successfully",
  });
});

// Function to get all schools
const getAllSchools = asyncHandler(async (req, res) => {
  const schools = await School.find({});
  if (!schools || schools.length === 0) {
    throw new ApiError(404, "No schools found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, schools, "Schools retrieved successfully"));
});

export { registerSchool, getAllSchools };
