import { asyncHandler } from "../utils/asyncHandler.js";
import { ExamSchedule } from "../models/examSchedule.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addExamDate = asyncHandler(async (req, res) => {
  const { subject, date, shift, rooms, standard } = req.body;
  if (!subject || !date || !shift || !rooms) {
    throw new ApiError(400, "All fields are required");
  }

  const examScheduleExists = await ExamSchedule.findOne({
    $and: [{ subject, date, shift }],
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
  // Send back a response indicating success
  const newExamScheduleData = await ExamSchedule.findById(
    createdExamSchedule._id
  );
  if (!newExamScheduleData) {
    throw new ApiError(
      500,
      "Something went wrong while adding exam schedule data"
    );
  }
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,
        newExamScheduleData,
        "Exam schedule added successfully"
      )
    );
});

// Function to get all exam schedules
const getAllExamSchedules = asyncHandler(async (req, res) => {
  const examSchedules = await ExamSchedule.find({});
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
