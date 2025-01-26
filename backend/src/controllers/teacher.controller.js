import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a new teacher
const registerTeacher = asyncHandler(async (req, res) => {
  const { name, subjects, school, duties } = req.body;

  // Validate input
  if (!name || !Array.isArray(subjects) || subjects.length === 0 || !school) {
    throw new ApiError(400, "All fields are required");
  }

  // Use dynamically compiled Teacher model from req.models
  const Teacher = req.models.Teacher;

  // Check if teacher already exists
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

  // Fetch newly created teacher data
  const newTeacherData = await Teacher.findById(createdTeacher._id)
    .populate({ path: "subjects", select: "name" }) // Populate subjects with only their name
    .populate({ path: "school", select: "name" }); // Populate school with only its name

  if (!newTeacherData) {
    throw new ApiError(500, "Something went wrong while adding teacher data");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newTeacherData, "Teacher added successfully"));
});

// Function to get all teachers
const getAllTeachers = asyncHandler(async (req, res) => {
  // Use dynamically compiled Teacher model from req.models
  const Teacher = req.models.Teacher;

  // Fetch teachers and populate 'subjects' and 'school' with their 'name' fields
  const teachers = await Teacher.find({})
    .populate({ path: "subjects", select: "name" }) // Populate subjects with only their name
    .populate({ path: "school", select: "name" }); // Populate school with only its name

  if (!teachers || teachers.length === 0) {
    throw new ApiError(404, "No teachers found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "Teachers retrieved successfully"));
});

export { registerTeacher, getAllTeachers };
