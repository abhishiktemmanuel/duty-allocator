import { asyncHandler } from "../utils/asyncHandler.js";
import { School } from "../models/school.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerSchool = asyncHandler(async (req, res) => {
  const { name } = req.body;
  if (!name) {
    throw new ApiError(400, "School name is required");
  }

  const schoolExists = await School.findOne({ name });
  if (schoolExists) {
    throw new ApiError(409, "School already exists");
  }
  const school = await School.create({ name });
  const newSchoolData = await School.findById(school._id);
  if (!newSchoolData) {
    throw new ApiError(500, "Something went wrong while adding school data");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, newSchoolData, "School added successfully"));
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
