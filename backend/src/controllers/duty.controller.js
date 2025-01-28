import { fetchAllTeachers } from "./teacher.controller.js";
import { fetchAllExamSchedules } from "./schedule.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const dutySetter = async (req, res) => {
  try {
    const Duty = req.models.Duty;
    const Teacher = req.models.Teacher;

    const teachersData = await fetchAllTeachers(req.models);
    const examSchedulesData = await fetchAllExamSchedules(req.models);

    // Transform data while preserving original structure
    const teachers = teachersData.map((teacher) => ({
      _id: teacher._id,
      name: teacher.name,
      subjects: teacher.subjects, // Keep original subject objects
      school: teacher.school, // Keep original school object
      duties: teacher.duties.map((duty) => ({
        _id: duty._id,
        date: duty.date,
        shift: duty.shift,
      })),
    }));

    const examSchedules = examSchedulesData.map((examSchedule) => ({
      _id: examSchedule._id,
      subject: examSchedule.subject, // Keep original subject object
      date: examSchedule.date,
      shift: examSchedule.shift,
      rooms: examSchedule.rooms,
    }));

    let tempTeachers = [...teachers];

    const meetsFullCriteria = (teacher, exam, alreadyChosen) => {
      if (!teacher?.subjects || !exam?.subject?._id) return false;

      const teachesExamSubject = teacher.subjects.some(
        (subject) =>
          subject?._id &&
          exam.subject._id &&
          subject._id.toString() === exam.subject._id.toString()
      );
      if (teachesExamSubject) return false;

      const hasOverlappingDuty = teacher.duties?.some(
        (duty) =>
          duty?.date &&
          exam?.date &&
          duty.date.toISOString().split("T")[0] ===
            exam.date.toISOString().split("T")[0] &&
          duty.shift === exam.shift
      );
      if (hasOverlappingDuty) return false;

      if (
        alreadyChosen?.school?._id &&
        teacher?.school?._id &&
        alreadyChosen.school._id.toString() === teacher.school._id.toString()
      ) {
        return false;
      }

      return true;
    };

    const meetsRelaxedCriteria = (teacher, exam) => {
      if (!teacher?.subjects || !exam?.subject?._id) return false;

      const teachesExamSubject = teacher.subjects.some(
        (subject) =>
          subject?._id &&
          exam.subject._id &&
          subject._id.toString() === exam.subject._id.toString()
      );
      if (teachesExamSubject) return false;

      const hasOverlappingDuty = teacher.duties?.some(
        (duty) =>
          duty?.date &&
          exam?.date &&
          duty.date.toISOString().split("T")[0] ===
            exam.date.toISOString().split("T")[0] &&
          duty.shift === exam.shift
      );
      if (hasOverlappingDuty) return false;

      return true;
    };

    const findTeacher = (exam, alreadyChosen, relaxed = false) => {
      for (let i = 0; i < tempTeachers.length; i++) {
        const currentTeacher = tempTeachers[i];
        const isEligible = relaxed
          ? meetsRelaxedCriteria(currentTeacher, exam)
          : meetsFullCriteria(currentTeacher, exam, alreadyChosen);

        if (isEligible) {
          tempTeachers.splice(i, 1);
          return currentTeacher;
        }
      }
      return null;
    };

    for (const exam of examSchedules) {
      const selectedInvidulators = [];

      while (selectedInvidulators.length < 2) {
        let teacher =
          findTeacher(exam, selectedInvidulators[0]) ||
          findTeacher(exam, selectedInvidulators[0], true);

        if (!teacher) {
          throw new ApiError(
            400,
            "Not enough eligible teachers available for all duties"
          );
        }

        selectedInvidulators.push(teacher);
      }

      if (
        selectedInvidulators[0]?.subjects?.some(
          (subject) =>
            subject?._id &&
            exam.subject?._id &&
            subject._id.toString() === exam.subject._id.toString()
        )
      ) {
        const alternateTeacher = findTeacher(exam, null, true);
        if (!alternateTeacher) {
          throw new ApiError(
            400,
            "Unable to resolve subject conflict for invigilators"
          );
        }

        tempTeachers.push(selectedInvidulators[0]);
        selectedInvidulators[0] = alternateTeacher;
      }

      try {
        const newDuty = new Duty({
          date: exam.date,
          shift: exam.shift,
          invidulator1: selectedInvidulators[0]._id,
          invidulator2: selectedInvidulators[1]._id,
          subject: exam.subject._id,
          room: exam.rooms[0], // Using first room from the array
          standard: exam.standard,
        });
        await newDuty.save();
        console.log("newDuty", newDuty);

        for (const invigilator of selectedInvidulators) {
          if (invigilator?._id) {
            await Teacher.findByIdAndUpdate(invigilator._id, {
              $push: { duties: newDuty._id },
            });
          }
        }
      } catch (err) {
        throw new ApiError(400, "Failed to assign duty. Please try again.");
      }
    }

    const allDuties = await Duty.find({})
      .populate("invidulator1", "name")
      .populate("invidulator2", "name")
      .populate("subject", "name");

    return res
      .status(200)
      .json(
        new ApiResponse(
          200,
          allDuties,
          "Duties assigned and retrieved successfully"
        )
      );
  } catch (error) {
    console.error("Error assigning duties:", error);
    return res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export { dutySetter };
