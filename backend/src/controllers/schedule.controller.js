import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";
import moment from "moment";

// Helper function to fetch all exam schedules
const fetchAllExamSchedules = async (models) => {
  const ExamSchedule = models.ExamSchedule;

  const examSchedules = await ExamSchedule.find({})
    .populate({
      path: "subject",
      model: models.Subject,
      select: "name",
    })
    .sort({ date: -1 })
    .lean();

  if (!examSchedules?.length) {
    throw new ApiError(404, "No exam schedules found");
  }

  return examSchedules;
};

// Add a new exam schedule
const addExamDate = asyncHandler(async (req, res) => {
  const { subject, date, shift, rooms, standard } = req.body;

  // Validate required fields
  if (!subject || !date || !shift || !rooms?.length) {
    throw new ApiError(400, "All fields are required", {
      missingFields: {
        subject: !subject ? "Subject is missing" : undefined,
        date: !date ? "Date is missing" : undefined,
        shift: !shift ? "Shift is missing" : undefined,
        rooms: !rooms?.length ? "Rooms are missing" : undefined,
      },
    });
  }
  // Validate subject ID format
  if (!mongoose.Types.ObjectId.isValid(subject)) {
    throw new ApiError(400, "Invalid subject ID format");
  }

  // Validate shift value
  if (!["Morning", "Evening"].includes(shift)) {
    throw new ApiError(
      400,
      "Invalid shift value. Allowed values are 'Morning' or 'Evening'"
    );
  }

  const ExamSchedule = req.models.ExamSchedule;

  // Check if exam schedule already exists
  const examScheduleExists = await ExamSchedule.findOne({
    $and: [{ subject }, { date }, { shift }],
  });
  if (examScheduleExists) {
    throw new ApiError(409, "This exam already exists");
  }

  // Save the exam schedule
  const createdExamSchedule = await ExamSchedule.create({
    subject,
    date,
    shift,
    rooms,
    standard,
  });

  if (!createdExamSchedule) {
    throw new ApiError(500, "Failed to create exam schedule");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        createdExamSchedule,
        "Exam schedule added successfully"
      )
    );
});

// Get all exam schedules (API controller)
const getAllExamSchedules = asyncHandler(async (req, res) => {
  const examSchedules = await fetchAllExamSchedules(req.models);

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        examSchedules,
        "Exam schedules retrieved successfully"
      )
    );
});

// Edit exam schedule
const editExamSchedule = asyncHandler(async (req, res) => {
  const { examId } = req.params;
  const { subject, date, shift, rooms, standard } = req.body;

  // Validate exam ID
  if (!examId) {
    throw new ApiError(400, "Exam ID is required");
  }

  // Validate required fields
  if (!subject && !date && !shift && !rooms?.length) {
    throw new ApiError(400, "At least one field is required for update");
  }

  // Validate shift value if provided
  if (shift && !["Morning", "Evening"].includes(shift)) {
    throw new ApiError(
      400,
      "Invalid shift value. Allowed values are 'Morning' or 'Evening'"
    );
  }

  const ExamSchedule = req.models.ExamSchedule;

  // Find and update exam schedule
  const updatedExamSchedule = await ExamSchedule.findByIdAndUpdate(
    examId,
    {
      $set: {
        subject: subject || undefined,
        date: date || undefined,
        shift: shift || undefined,
        rooms: rooms || undefined,
        standard: standard || undefined,
      },
    },
    { new: true }
  ).populate({
    path: "subject",
    model: req.models.Subject,
    select: "name",
  });

  if (!updatedExamSchedule) {
    throw new ApiError(404, "Exam schedule not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedExamSchedule,
        "Exam schedule updated successfully"
      )
    );
});

// Delete exam schedule
const deleteExamSchedule = asyncHandler(async (req, res) => {
  const { examId } = req.params;

  // Validate exam ID
  if (!examId) {
    throw new ApiError(400, "Exam ID is required");
  }

  const ExamSchedule = req.models.ExamSchedule;

  // Find and delete exam schedule
  const deletedExamSchedule = await ExamSchedule.findByIdAndDelete(examId);

  if (!deletedExamSchedule) {
    throw new ApiError(404, "Exam schedule not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Exam schedule deleted successfully"));
});

const deleteMultipleExamSchedules = asyncHandler(async (req, res) => {
  const { examIds } = req.body;

  if (!examIds || !Array.isArray(examIds)) {
    throw new ApiError(400, "Invalid exam IDs provided");
  }

  const ExamSchedule = req.models.ExamSchedule;
  const deleteResult = await ExamSchedule.deleteMany({ _id: { $in: examIds } });

  if (deleteResult.deletedCount === 0) {
    throw new ApiError(404, "No schedules found to delete");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        null,
        `${deleteResult.deletedCount} schedules deleted successfully`
      )
    );
});

const addBulkExamSchedules = asyncHandler(async (req, res) => {
  const { schedules } = req.body;

  if (!schedules || !Array.isArray(schedules)) {
    throw new ApiError(400, "Schedules array is required");
  }

  const ExamSchedule = req.models.ExamSchedule;
  const Subject = req.models.Subject;
  const results = [];
  const errors = [];

  const parseDate = (dateString) => {
    // Try multiple date formats
    const formats = [
      "YYYY-MM-DD", // 2023-01-05
      "YYYY-M-D", // 2023-1-5
      "DD/MM/YYYY", // 05/01/2023
      "D/M/YYYY", // 5/1/2023
      "MM/DD/YYYY", // 01/05/2023
      "M/D/YYYY", // 1/5/2023
      "YYYY/MM/DD", // 2023/01/05
      "YYYY/M/D", // 2023/1/5
      "DD-MM-YYYY", // 05-01-2023
      "D-M-YYYY", // 5-1-2023
      "MM-DD-YYYY", // 01-05-2023
      "M-D-YYYY", // 1-5-2023
      "YYYY.MM.DD", // 2023.01.05
      "YYYY.M.D", // 2023.1.5
      "D.M.YYYY", // 5.1.2023
      "M.D.YYYY", // 1.5.2023
    ];

    let parsedDate;
    for (const format of formats) {
      parsedDate = moment(dateString, format, true);
      if (parsedDate.isValid()) break;
    }

    return parsedDate.isValid() ? parsedDate.toDate() : null;
  };

  const processSchedule = async (schedule, index) => {
    try {
      const rawSchedule = { ...schedule };

      // Normalize keys to lowercase
      const normalizedSchedule = Object.keys(rawSchedule).reduce((acc, key) => {
        acc[key.toLowerCase()] = rawSchedule[key];
        return acc;
      }, {});

      const {
        subject: subjectName,
        date,
        shift,
        rooms,
        standard,
      } = normalizedSchedule;

      // Validate required fields
      const missingFields = [];
      if (!subjectName) missingFields.push("subject");
      if (!date) missingFields.push("date");
      if (!shift) missingFields.push("shift");
      if (!rooms) missingFields.push("rooms");

      if (missingFields.length > 0) {
        errors.push({
          row: index + 1,
          error: `Missing required fields: ${missingFields.join(", ")}`,
          rawData: rawSchedule,
        });
        return;
      }

      // Parse date
      const parsedDate = parseDate(date);
      if (!parsedDate) {
        errors.push({
          row: index + 1,
          error: `Invalid date format: ${date}`,
          rawData: rawSchedule,
        });
        return;
      }

      // Normalize shift
      const normalizedShift =
        shift.charAt(0).toUpperCase() + shift.slice(1).toLowerCase();
      if (!["Morning", "Evening"].includes(normalizedShift)) {
        errors.push({
          row: index + 1,
          error: `Invalid shift: ${shift}`,
          rawData: rawSchedule,
        });
        return;
      }

      // Process subject
      const subjectNameNormalized = subjectName.trim().toLowerCase();
      let subject = await Subject.findOne({
        name: { $regex: new RegExp(`^${subjectNameNormalized}$`, "i") },
      });

      if (!subject) {
        try {
          subject = await Subject.create({ name: subjectName.trim() });
        } catch (error) {
          errors.push({
            row: index + 1,
            error: `Failed to create subject: ${error.message}`,
            rawData: rawSchedule,
          });
          return;
        }
      }

      // Process rooms
      const roomsArray =
        typeof rooms === "string"
          ? rooms.split(",").map((r) => r.trim())
          : Array.isArray(rooms)
            ? rooms
            : [];

      if (roomsArray.length === 0) {
        errors.push({
          row: index + 1,
          error: "No valid rooms provided",
          rawData: rawSchedule,
        });
        return;
      }

      // Check for existing schedule
      const existing = await ExamSchedule.findOne({
        subject: subject._id,
        date: parsedDate,
        shift: normalizedShift,
      });

      if (existing) {
        errors.push({
          row: index + 1,
          error: "Schedule already exists",
          rawData: rawSchedule,
        });
        return;
      }

      // Create new schedule
      const newSchedule = await ExamSchedule.create({
        subject: subject._id,
        date: parsedDate,
        shift: normalizedShift,
        rooms: roomsArray,
        standard: standard?.trim(),
      });

      results.push(newSchedule);
    } catch (error) {
      errors.push({
        row: index + 1,
        error: error.message,
        rawData: rawSchedule,
      });
    }
  };

  // Process schedules in sequence for better error tracking
  for (let i = 0; i < schedules.length; i++) {
    await processSchedule(schedules[i], i);
  }

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        total: schedules.length,
        successCount: results.length,
        errorCount: errors.length,
        errors,
        sampleError: errors[0], // Send first error as sample
      },
      "Bulk upload completed"
    )
  );
});
export {
  addExamDate,
  getAllExamSchedules,
  fetchAllExamSchedules,
  editExamSchedule,
  deleteExamSchedule,
  addBulkExamSchedules,
  deleteMultipleExamSchedules,
};
