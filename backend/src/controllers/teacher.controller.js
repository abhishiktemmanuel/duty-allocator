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

    // First pass: Validate and prepare data
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
        const existingTeacher = await Teacher.findOne({
          name,
          organization: orgId,
        });
        if (existingTeacher) {
          errors.push({
            row: index + 1,
            error: "Teacher already exists in this organization",
          });
          continue;
        }

        // Process subjects - AUTO-CREATE IF MISSING
        const subjectNames = row.subjects.split(",").map((s) => s.trim());
        const subjects = [];
        for (const subjName of subjectNames) {
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
      // Create global users in batch
      const globalUsers = await User.insertMany(
        results.map((teacher) => ({
          name: teacher.name,
          role: "endUser",
          organizations: [],
        }))
      );

      // Add globalUserId to teacher data
      const teacherData = results.map((teacher, index) => ({
        ...teacher,
        globalUserId: globalUsers[index]._id,
      }));

      // Insert teachers
      const createdTeachers = await Teacher.insertMany(teacherData, {
        ordered: false,
      });

      // Generate merge tokens
      const mergeTokens = createdTeachers.map((teacher) =>
        jwt.sign(
          {
            teacherId: teacher._id,
            organizationId: orgId,
            globalUserId: teacher.globalUserId,
          },
          process.env.JWT_SECRET,
          { expiresIn: "7d" }
        )
      );

      // Update global users with merge tokens
      await Promise.all(
        globalUsers.map((user, index) =>
          User.findByIdAndUpdate(user._id, {
            $push: {
              mergeRequests: {
                token: mergeTokens[index],
                organizationId: orgId,
                teacherId: createdTeachers[index]._id,
                expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
              },
            },
          })
        )
      );

      // Populate teacher data for response
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
            mergeTokens, // For testing purposes, remove in production
          },
          "Bulk upload completed successfully"
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
    // Cleanup any created users if the operation fails
    if (globalUsers && globalUsers.length > 0) {
      await User.deleteMany({ _id: { $in: globalUsers.map((u) => u._id) } });
    }
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

  const globalUser = await User.create({
    name: name,
    role: "endUser",
    organizations: [],
  });

  const createdTeacher = await Teacher.create({
    name,
    subjects,
    school,
    duties,
    organization: orgId,
    globalUserId: globalUser._id,
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

  // Find the teacher first
  const teacher = await Teacher.findById(teacherId);

  if (!teacher) {
    throw new ApiError(404, "Teacher not found");
  }

  // Delete the associated user using globalUserId
  await User.findByIdAndDelete(teacher.globalUserId);

  // Now delete the teacher
  await Teacher.findByIdAndDelete(teacherId);

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

const updateTeacher = asyncHandler(async (req, res) => {
  const { teacherId } = req.params;
  const { name, subjects, school, duties } = req.body;
  const Teacher = req.models.Teacher;

  if (!teacherId) {
    throw new ApiError(400, "Teacher ID is required");
  }

  const existingTeacher = await Teacher.findById(teacherId);
  if (!existingTeacher) {
    throw new ApiError(404, "Teacher not found");
  }

  // Extract the ObjectId from the school object
  const schoolId =
    school && school.value ? school.value : existingTeacher.school;

  // Parse subjects if it's a string
  let subjectIds = existingTeacher.subjects;

  if (subjects) {
    if (typeof subjects === "string") {
      try {
        const parsedSubjects = JSON.parse(subjects);
        subjectIds = parsedSubjects.map((subject) => subject.value);
      } catch (error) {
        throw new ApiError(400, "Invalid subjects format");
      }
    } else if (Array.isArray(subjects)) {
      subjectIds = subjects.map((subject) => subject.value);
    }
  }

  // Ensure subjectIds is never empty
  if (subjectIds.length === 0) {
    throw new ApiError(400, "At least one subject is required");
  }

  const updatedTeacher = await Teacher.findByIdAndUpdate(
    teacherId,
    {
      $set: {
        name: name || existingTeacher.name,
        subjects: subjectIds,
        school: schoolId,
        duties: duties || existingTeacher.duties,
      },
    },
    { new: true, runValidators: true }
  )
    .populate({ path: "subjects", select: "name" })
    .populate({ path: "school", select: "name" });

  // Update associated user if name is changed
  if (name && name !== existingTeacher.name) {
    await User.findOneAndUpdate(
      { _id: existingTeacher.globalUserId },
      {
        $set: {
          name: name,
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
  const { teacherIds } = req.body;
  const orgId = req.headers["x-org-id"];

  if (!teacherIds || !Array.isArray(teacherIds) || teacherIds.length === 0) {
    throw new ApiError(400, "Teacher IDs array is required");
  }

  if (!orgId) {
    throw new ApiError(400, "Organization ID is required in headers");
  }

  const Teacher = req.models.Teacher;

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Validate teachers belong to the organization
    const teachers = await Teacher.find({
      _id: { $in: teacherIds },
      organization: orgId,
    }).session(session);

    if (teachers.length === 0) {
      throw new ApiError(404, "No teachers found for deletion");
    }

    const validTeacherIds = teachers.map((t) => t._id);
    const globalUserIds = teachers.map((t) => t.globalUserId);

    // Update user associations
    const userUpdateResult = await User.bulkWrite(
      [
        {
          updateMany: {
            filter: { "organizations.teacherId": { $in: validTeacherIds } },
            update: {
              $pull: {
                organizations: {
                  teacherId: { $in: validTeacherIds },
                  organizationId: orgId,
                },
              },
            },
          },
        },
        {
          updateMany: {
            filter: { _id: { $in: globalUserIds } },
            update: { $set: { role: "inactive" } },
          },
        },
      ],
      { session }
    );

    // Delete teachers
    const teacherDeleteResult = await Teacher.deleteMany({
      _id: { $in: validTeacherIds },
    }).session(session);

    await session.commitTransaction();

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          deletedTeachersCount: teacherDeleteResult.deletedCount,
          updatedUsersCount: userUpdateResult.modifiedCount,
        },
        "Teachers and user associations removed successfully"
      )
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Delete operation failed:", error);
    throw new ApiError(500, `Operation failed: ${error.message}`);
  } finally {
    session.endSession();
  }
});

const mergeTeacherAccount = asyncHandler(async (req, res) => {
  const { token } = req.body;
  const user = req.user;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Verify token matches user
    if (decoded.globalUserId.toString() !== user._id.toString()) {
      throw new ApiError(403, "Invalid merge token");
    }

    // Add organization connection
    const update = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          organizations: {
            organizationId: decoded.organizationId,
            teacherId: decoded.teacherId,
            status: "Active",
            joinedAt: new Date(),
          },
        },
        $pull: { mergeRequests: { token } },
      },
      { new: true }
    );

    return res
      .status(200)
      .json(new ApiResponse(200, update, "Account merged successfully"));
  } catch (error) {
    throw new ApiError(400, error.message);
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
  mergeTeacherAccount,
};
