import { Teacher } from "../models/teacher.model.js";
import { ApiError } from "../utils/ApiError.js";

// Fetch teacher details
export const getAllTeachers = async () => {
  console.log("ok");
  try {
    const teachers = await Teacher.find()
      .populate("subjects", "name")
      .populate("school", "name")
      .select("-duties")
      .exec();

    if (!teachers || teachers.length === 0) {
      throw new ApiError(404, "No teachers found");
    }

    // Transform data
    const teacherDetails = teachers.map((teacher) => ({
      id: teacher._id,
      name: teacher.name,
      subjects: teacher.subjects.map((subject) => subject.name),
      school: teacher.school.name,
    }));
    return teacherDetails;
  } catch (error) {
    throw error;
  }
};
