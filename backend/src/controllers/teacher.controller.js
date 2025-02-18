import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { User } from "../models/authModels/User.js";
import csvParser from "csv-parser";
import { Readable } from "stream";

const parseCSV = (buffer) => {
  return new Promise((resolve, reject) => {
    const results = [];
    const parser = csvParser();
    const stream = Readable.from(buffer.toString());

    stream
      .pipe(parser)
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", (error) => reject(error));
  });
};

const addBulkTeachers = asyncHandler(async (req, res) => {
  const orgId = req.headers["x-org-id"];
  const file = req.file;

  if (!file) {
    throw new ApiError(400, "CSV file is required");
  }

  if (!orgId) {
    throw new ApiError(400, "Organization ID is required in headers");
  }

  const Teacher = req.models.Teacher;
  const Subject = req.models.Subject;
  const School = req.models.School;

  const results = [];
  const errors = [];
  const processedNames = new Set();

  try {
    const rows = await parseCSV(file.buffer);

    for (const [index, row] of rows.entries()) {
      try {
        if (!row.name || !row.subjects || !row.school) {
          throw new Error("Missing required fields (name, subjects, school)");
        }

        const name = row.name.trim();

        // Check for duplicate in CSV
        if (processedNames.has(name)) {
          errors.push({ row: index + 1, error: "Duplicate name in CSV" });
          continue;
        }
        processedNames.add(name);

        // Check if teacher exists in DB
        const existingTeacher = await Teacher.findOne({ name });
        if (existingTeacher) {
          errors.push({ row: index + 1, error: "Teacher already exists" });
          continue;
        }

        // Process subjects - AUTO-CREATE IF MISSING
        const subjectNames = row.subjects.split(",").map((s) => s.trim());
        const subjects = [];
        for (const subjName of subjectNames) {
          // Find subject in current organization's collection
          let subject = await Subject.findOne({ name: subjName });

          if (!subject) {
            subject = await Subject.create({ name: subjName });
          }
          subjects.push(subject._id);
        }

        // Process school - AUTO-CREATE IF MISSING
        const schoolName = row.school.trim();
        let school = await School.findOne({ name: schoolName });

        if (!school) {
          school = await School.create({ name: schoolName });
        }

        // Prepare teacher data
        results.push({
          name,
          subjects,
          school: school._id,
          organization: orgId,
        });
      } catch (error) {
        errors.push({ row: index + 1, error: error.message });
      }
    }

    if (results.length > 0) {
      const createdTeachers = await Teacher.insertMany(results, {
        ordered: false,
      });

      const populatedTeachers = await Teacher.find({
        _id: { $in: createdTeachers.map((t) => t._id) },
      })
        .populate("subjects", "name")
        .populate("school", "name");

      return res.status(200).json(
        new ApiResponse(
          200,
          {
            successCount: createdTeachers.length,
            errorCount: errors.length,
            errors,
            teachers: populatedTeachers,
          },
          "Bulk upload completed"
        )
      );
    } else {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            successCount: 0,
            errorCount: errors.length,
            errors,
            teachers: [],
          },
          "No valid teachers to insert"
        )
      );
    }
  } catch (error) {
    throw new ApiError(500, error.message);
  }
});

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

const deleteMultipleTeachers = asyncHandler(async (req, res) => {
  console.log("Delete multiple teachers");
  const { teacherIds } = req.body;
  const orgId = req.headers["x-org-id"];

  if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
    throw new ApiError(400, "Teacher IDs array is required");
  }

  if (!orgId) {
    throw new ApiError(400, "Organization ID is required in headers");
  }

  const Teacher = req.models.Teacher;

  try {
    // Validate teachers belong to the organization
    const teachers = await Teacher.find({
      _id: { $in: teacherIds },
      organization: orgId,
    });

    if (teachers.length === 0) {
      throw new ApiError(404, "No teachers found for deletion");
    }

    const validTeacherIds = teachers.map((t) => t._id);

    // Update user associations
    await User.updateMany(
      { "organizations.teacherId": { $in: validTeacherIds } },
      { $pull: { organizations: { teacherId: { $in: validTeacherIds } } } }
    );

    // Delete teachers
    const deleteResult = await Teacher.deleteMany({
      _id: { $in: validTeacherIds },
    });

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          { deletedCount: deleteResult.deletedCount },
          "Teachers and user associations removed successfully"
        )
      );
  } catch (error) {
    console.error("Delete operation failed:", error);
    throw new ApiError(500, error.message);
  }
});

export {
  registerTeacher,
  fetchAllTeachers,
  getAllTeachers,
  deleteTeacher,
  updateTeacher,
  addBulkTeachers,
  deleteMultipleTeachers,
};
