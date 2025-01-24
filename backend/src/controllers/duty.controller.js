import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

import { Duty } from "../models/duty.model.js";
import { Teacher } from "../models/teacher.model.js";
import { getSchedule } from "../services/getSchedule.js";
import { fetchTeacherDetails } from "../services/getAllTeachers.js";

export const dutySetter = asyncHandler(async () => {
  try {
    // Call fetchTeacherDetails dynamically
    const teachers = await fetchTeacherDetails();
    const examSchedules = await getSchedule();

    // Perform operations to set duties here...
  } catch (error) {
    console.error("Error fetching data:", error.message);
    throw error; // Re-throw for further handling if required
  }
});

// // import { asyncHandler } from "../utils/asyncHandler.js";
// // import { ApiError } from "../utils/ApiError.js";
// // import { Duty } from "../models/duty.model.js";
// // import { Teacher } from "../models/teacher.model.js";

// // import { teacherDetailsPromise } from "../services/getSchedule.js";
// // import { getAllTeachers } from "../services/getAllTeachers.js";

// // const dutySetter = asyncHandler(async () => {
// //   try {
// //     // Fetch teachers and exam schedules concurrently
// //     const [teachers, examSchedules] = await Promise.all([
// //       getAllTeachers(), // Fetch teacher details
// //       getSchedule(), // Fetch exam schedules
// //     ]);
// //     console.log(teachers, examSchedules);

// //     if (!teachers.length || !examSchedules.length) {
// //       throw new ApiError(404, "No teachers or exam schedules found");
// //     }

// //     // Initialize a map to track duties assigned to each teacher
// //     const teacherDutyCount = new Map();
// //     teachers.forEach((teacher) => teacherDutyCount.set(teacher.id, 0));

// //     // Initialize an array to store new duties
// //     const newDuties = [];

// //     // Assign duties for each exam schedule
// //     for (const schedule of examSchedules) {
// //       const { date, shift, subject, room, standard } = schedule;

// //       // Filter eligible teachers
// //       const eligibleTeachers = teachers.filter((teacher) => {
// //         // Exclude teachers who teach the subject of the exam
// //         if (teacher.subjects.includes(subject)) return false;

// //         // Ensure no two teachers from the same school are assigned to the same room
// //         const otherDutiesInRoom = newDuties.filter(
// //           (duty) =>
// //             duty.room === room &&
// //             duty.date.toISOString() === date.toISOString() &&
// //             duty.shift === shift
// //         );
// //         if (
// //           otherDutiesInRoom.some(
// //             (duty) => duty.invidulator1.school === teacher.school
// //           )
// //         )
// //           return false;

// //         // Ensure the teacher doesn't already have a duty in the same shift and date
// //         if (
// //           newDuties.some(
// //             (duty) =>
// //               (duty.invidulator1 === teacher.id ||
// //                 duty.invidulator2 === teacher.id) &&
// //               duty.date.toISOString() === date.toISOString() &&
// //               duty.shift === shift
// //           )
// //         ) {
// //           return false;
// //         }

// //         return true;
// //       });

// //       if (eligibleTeachers.length < 2) {
// //         throw new ApiError(
// //           400,
// //           `Not enough eligible teachers for room ${room} on ${date} (${shift})`
// //         );
// //       }

// //       // Sort eligible teachers by their current number of duties (to balance workload)
// //       eligibleTeachers.sort(
// //         (a, b) => teacherDutyCount.get(a.id) - teacherDutyCount.get(b.id)
// //       );

// //       // Assign two teachers with the least number of duties
// //       const [invidulator1, invidulator2] = eligibleTeachers.slice(0, 2);

// //       // Create a new duty entry
// //       const newDuty = new Duty({
// //         date,
// //         shift,
// //         invidulator1: invidulator1.id,
// //         invidulator2: invidulator2.id,
// //         subject,
// //         room,
// //         standard,
// //       });

// //       newDuties.push(newDuty);

// //       // Update the duty count for each assigned teacher
// //       teacherDutyCount.set(
// //         invidulator1.id,
// //         teacherDutyCount.get(invidulator1.id) + 1
// //       );
// //       teacherDutyCount.set(
// //         invidulator2.id,
// //         teacherDutyCount.get(invidulator2.id) + 1
// //       );
// //     }

// //     // Save all new duties to the database
// //     const savedDuties = await Duty.insertMany(newDuties);

// //     // Update each teacher's record with their assigned duties
// //     for (const duty of savedDuties) {
// //       await Teacher.findByIdAndUpdate(duty.invidulator1, {
// //         $push: { duties: duty._id },
// //       });
// //       await Teacher.findByIdAndUpdate(duty.invidulator2, {
// //         $push: { duties: duty._id },
// //       });
// //     }

// //     console.log("Duties successfully assigned and saved.");
// //   } catch (error) {
// //     console.error("Error assigning duties:", error.message);
// //     throw error; // Re-throw the error for further handling if required
// //   }
// // });

// // export { dutySetter };
