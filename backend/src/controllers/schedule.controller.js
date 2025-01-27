import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Add a new exam schedule
const addExamDate = asyncHandler(async (req, res) => {
  const { subject, date, shift, rooms, standard } = req.body;

  // Validate required fields
  if (!subject || !date || !shift || !rooms?.length) {
    return res.status(400).json({
      status: "error",
      message: "All fields are required.",
      missingFields: {
        subject: !subject ? "Subject is missing" : undefined,
        date: !date ? "Date is missing" : undefined,
        shift: !shift ? "Shift is missing" : undefined,
        rooms: !rooms?.length ? "Rooms are missing" : undefined,
      },
    });
  }

  // Validate shift value
  if (!["Morning", "Evening"].includes(shift)) {
    return res.status(400).json({
      status: "error",
      message:
        "Invalid shift value. Allowed values are 'Morning' or 'Evening'.",
    });
  }

  // Use dynamically compiled ExamSchedule model from req.models
  const ExamSchedule = req.models.ExamSchedule;

  // Check if exam schedule already exists for the same subject, date, and shift
  const examScheduleExists = await ExamSchedule.findOne({
    $and: [{ subject }, { date }, { shift }],
  });
  if (examScheduleExists) {
    throw new ApiError(409, "This exam already exists");
  }

  // Save the exam schedule to the database
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

  return res.status(201).json({
    status: "success",
    data: createdExamSchedule,
    message: "Exam schedule added successfully",
  });
});

// Function to get all exam schedules
const getAllExamSchedules = asyncHandler(async (req, res) => {
  const ExamSchedule = req.models.ExamSchedule;

  const examSchedules = await ExamSchedule.find({})
    .populate({
      path: "subject",
      model: req.models.Subject, // Add this line to explicitly specify the model
      select: "name",
    })
    .sort({ date: -1 }) // Sort by date in descending order
    .lean(); // Add lean() for better performance

  if (!examSchedules || examSchedules.length === 0) {
    throw new ApiError(404, "No exam schedules found");
  }

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

export { addExamDate, getAllExamSchedules };
