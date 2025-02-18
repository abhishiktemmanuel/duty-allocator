import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

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
  const results = [];
  const errors = [];

  console.log("Starting bulk upload of schedules..."); // Debugging

  // Process schedules in parallel
  await Promise.all(
    schedules.map(async (schedule) => {
      try {
        console.log("Processing schedule:", schedule); // Debugging

        const { subject, date, shift, rooms, standard } = schedule;

        // Validate existing schedule
        const existing = await ExamSchedule.findOne({
          subject,
          date: new Date(date),
          shift,
        });

        if (existing) {
          console.log("Schedule already exists:", schedule); // Debugging
          errors.push({ schedule, error: "Schedule already exists" });
          return;
        }

        // Create new schedule
        const newSchedule = await ExamSchedule.create({
          subject,
          date: new Date(date),
          shift,
          rooms,
          standard,
        });

        console.log("Schedule created successfully:", newSchedule); // Debugging
        results.push(newSchedule);
      } catch (error) {
        console.error("Error creating schedule:", error); // Debugging
        errors.push({ schedule, error: error.message });
      }
    })
  );

  console.log("Bulk upload completed. Results:", results); // Debugging
  console.log("Errors during bulk upload:", errors); // Debugging

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { successCount: results.length, errorCount: errors.length, errors },
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
