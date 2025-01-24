import { asyncHandler } from "../utils/asyncHandler.js";
import { Teacher } from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const registerTeacher = asyncHandler(async (req, res) => {
  const { name, subjects, school, duties } = req.body;
  if (!name || !Array.isArray(subjects) || subjects.length === 0 || !school) {
    throw new ApiError(400, "All fields are required");
  }

  const teacherExists = await Teacher.findOne({
    $or: [{ name }],
  });
  if (teacherExists) {
    throw new ApiError(409, "Teacher already exists");
  }
  // Save the teacher to the database
  const createdTeacher = await Teacher.create({
    name,
    subjects,
    school,
    duties,
  });
  // Send back a response indicating success
  const newTeacherData = await Teacher.findById(createdTeacher._id);
  if (!newTeacherData) {
    throw new ApiError(500, "Something went wrong while adding teacher data");
  }
  return res
    .status(201)
    .json(new ApiResponse(200, newTeacherData, "Teacher added successfully"));
});

// Function to get all teachers
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await Teacher.find({});
  if (!teachers || teachers.length === 0) {
    throw new ApiError(404, "No teachers found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "Teachers retrieved successfully"));
});

export { registerTeacher, getAllTeachers };
