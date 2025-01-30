import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/authModels/User.js";

// Register a new teacher
const registerTeacher = asyncHandler(async (req, res) => {
  const { name, subjects, school, duties } = req.body;
  const orgId = req.headers["x-org-id"];

  if (!name || !Array.isArray(subjects) || subjects.length === 0 || !school) {
    throw new ApiError(400, "All fields are required");
  }
  if (!orgId) {
    throw new ApiError(400, "Organization ID is required in headers");
  }

  // Validate orgId format
  if (!/^[a-zA-Z0-9_-]+$/.test(orgId)) {
    throw new ApiError(400, "Invalid Organization ID format");
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
    organization: orgId,
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

// Core logic to fetch all teachers
const fetchAllTeachers = async (models) => {
  const Teacher = models.Teacher;

  const teachers = await Teacher.find({})
    .populate({ path: "subjects", select: "name" })
    .populate({ path: "school", select: "name" })
    .lean();

  if (!teachers || teachers.length === 0) {
    throw new ApiError(404, "No teachers found");
  }

  return teachers;
};

// Controller function for the API
const getAllTeachers = asyncHandler(async (req, res) => {
  const teachers = await fetchAllTeachers(req.models);

  return res
    .status(200)
    .json(new ApiResponse(200, teachers, "Teachers retrieved successfully"));
});

// // Delete a teacher
// const deleteTeacher = asyncHandler(async (req, res) => {
//   const { teacherId } = req.params;
//   const Teacher = req.models.Teacher;

//   if (!teacherId) {
//     throw new ApiError(400, "Teacher ID is required");
//   }

//   const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

//   if (!deletedTeacher) {
//     throw new ApiError(404, "Teacher not found");
//   }

//   return res
//     .status(200)
//     .json(new ApiResponse(200, {}, "Teacher deleted successfully"));
// });

// // Update a teacher
// const updateTeacher = asyncHandler(async (req, res) => {
//   const { teacherId } = req.params;
//   const { name, subjects, school, duties } = req.body;
//   const Teacher = req.models.Teacher;

//   if (!teacherId) {
//     throw new ApiError(400, "Teacher ID is required");
//   }

//   if (!name && !subjects && !school && !duties) {
//     throw new ApiError(400, "At least one field is required for update");
//   }

//   const existingTeacher = await Teacher.findById(teacherId);
//   if (!existingTeacher) {
//     throw new ApiError(404, "Teacher not found");
//   }

//   const updatedTeacher = await Teacher.findByIdAndUpdate(
//     teacherId,
//     {
//       $set: {
//         name: name || existingTeacher.name,
//         subjects: subjects || existingTeacher.subjects,
//         school: school || existingTeacher.school,
//         duties: duties || existingTeacher.duties,
//       },
//     },
//     { new: true }
//   )
//     .populate({ path: "subjects", select: "name" })
//     .populate({ path: "school", select: "name" });

//   return res
//     .status(200)
//     .json(new ApiResponse(200, updatedTeacher, "Teacher updated successfully"));
// });

// Delete a teacher
const deleteTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const Teacher = req.models.Teacher;

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }

  // Delete the associated user first
  await User.findOneAndDelete({ teacherId });

  const deletedTeacher = await Teacher.findByIdAndDelete(teacherId);

  if (!deletedTeacher) {
    throw new ApiError(404, "Teacher not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Teacher and associated user deleted successfully"
      )
    );
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

  // Update associated user if name is changed
  if (name && name !== existingTeacher.name) {
    const newEmail = `${name.toLowerCase().replace(/\s+/g, ".")}@school.com`;
    await User.findOneAndUpdate(
      { teacherId },
      {
        $set: {
          name: name,
          email: newEmail,
        },
      }
    );
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedTeacher,
        "Teacher and associated user updated successfully"
      )
    );
});

export {
  registerTeacher,
  fetchAllTeachers,
  getAllTeachers,
  deleteTeacher,
  updateTeacher,
};
