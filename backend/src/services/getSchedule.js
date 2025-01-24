import { ExamSchedule } from "../models/examSchedule.model.js";
import { ApiError } from "../utils/ApiError.js";

// Function to fetch and transform exam schedule data
export const getSchedule = async () => {
  try {
    // Fetch all exam schedules from the database
    const examSchedules = await ExamSchedule.find()
      .populate("subject", "name") // Populate subject field with its name
      .exec();

    if (!examSchedules || examSchedules.length === 0) {
      throw new ApiError(404, "No exam schedules found");
    }

    // Transform data: Each room on each shift for each day is treated separately
    const transformedData = [];
    examSchedules.forEach((schedule) => {
      const { subject, date, shift, rooms, standard } = schedule;
      rooms.forEach((room) => {
        transformedData.push({
          subject: subject.name || subject, // Use populated name or ObjectId
          date,
          shift,
          room,
          standard,
        });
      });
    });
    // Return the transformed data array
    return transformedData;
  } catch (error) {
    throw error; // Let the calling function handle the error
  }
};
