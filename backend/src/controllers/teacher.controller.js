import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Register a new teacher
const registerTeacher = asyncHandler(async (req, res) => {
  const { name, subjects, school, duties } = req.body;

  if (!name || !Array.isArray(subjects) || subjects.length === 0 || !school) {
    throw new ApiError(400, "All fields are required");
  }

  const Teacher = req.models.Teacher;

  const teacherExists = await Teacher.findOne({
    $or: [{ name }],
  });
  if (teacherExists) {
    throw new ApiError(409, "Teacher already exists");
  }

  const createdTeacher = await Teacher.create({
    name,
    subjects,
    school,
    duties,
  });

  const newTeacherData = await Teacher.findById(createdTeacher._id)
    .populate({ path: "subjects", select: "name" })
    .populate({ path: "school", select: "name" });

  if (!newTeacherData) {
    throw new ApiError(500, "Something went wrong while adding teacher data");
  }

  return res
    .status(201)
    .json(new ApiResponse(201, newTeacherData, "Teacher added successfully"));
});

// Get all teachers
const getAllTeachers = asyncHandler(async (req, res) => {
  const Teacher = req.models.Teacher;

  const teachers = await Teacher.find({})
    .populate({ path: "subjects", select: "name" })
    .populate({ path: "school", select: "name" });

  if (!teachers || teachers.length === 0) {
    throw new ApiError(404, "No teachers found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "Teachers retrieved successfully"));
});

// Delete a teacher
const deleteTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const Teacher = req.models.Teacher;

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }

  const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

  if (!deletedTeacher) {
    throw new ApiError(404, "Teacher not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Teacher deleted successfully"));
});

// Update a teacher
const updateTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { name, subjects, school, duties } = req.body;
  const Teacher = req.models.Teacher;

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }

  if (!name && !subjects && !school && !duties) {
    throw new ApiError(400, "At least one field is required for update");
  }

  const existingTeacher = await Teacher.findById(teacherId);
  if (!existingTeacher) {
    throw new ApiError(404, "Teacher not found");
  }

  const updatedTeacher = await Teacher.findByIdAndUpdate(
    teacherId,
    {
      $set: {
        name: name || existingTeacher.name,
        subjects: subjects || existingTeacher.subjects,
        school: school || existingTeacher.school,
        duties: duties || existingTeacher.duties,
      },
    },
    { new: true }
  )
    .populate({ path: "subjects", select: "name" })
    .populate({ path: "school", select: "name" });

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTeacher, "Teacher updated successfully"));
});

export { registerTeacher, getAllTeachers, deleteTeacher, updateTeacher };
