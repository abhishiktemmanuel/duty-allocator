import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const dutySetter = asyncHandler(async (req, res) => {
  try {
    // Use dynamically compiled models from req.models
    const Duty = req.models.Duty;
    const Teacher = req.models.Teacher;

    // Use services with dynamically compiled models
    const teachers = await req.services.getAllTeachers(req.models.Teacher);
    const examSchedules = await req.services.getSchedule(
      req.models.ExamSchedule
    );

    let tempTeachers = [...teachers];

    const meetsFullCriteria = (teacher, exam, alreadyChosen) => {
      const teachesExamSubject = teacher.subjects.some(
        (subj) => subj.toString() === exam.subject.toString()
      );
      if (teachesExamSubject) return false;

      const hasOverlappingDuty = teacher.duties?.some((duty) => {
        return (
          duty.date?.toISOString().split("T")[0] ===
            exam.date?.toISOString().split("T")[0] && duty.shift === exam.shift
        );
      });
      if (hasOverlappingDuty) return false;

      if (
        alreadyChosen &&
        alreadyChosen.school.toString() === teacher.school.toString()
      ) {
        return false;
      }

      return true;
    };

    const meetsRelaxedCriteria = (teacher, exam) => {
      const teachesExamSubject = teacher.subjects.some(
        (subj) => subj.toString() === exam.subject.toString()
      );
      if (teachesExamSubject) return false;

      const hasOverlappingDuty = teacher.duties?.some((duty) => {
        return (
          duty.date?.toISOString().split("T")[0] ===
            exam.date?.toISOString().split("T")[0] && duty.shift === exam.shift
        );
      });
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
          console.error("No eligible teacher found for exam:", exam);
          throw new ApiError(
            "Not enough eligible teachers available for all duties",
            400
          );
        }

        selectedInvidulators.push(teacher);
      }

      if (
        selectedInvidulators[0].subjects.some(
          (subj) => subj.toString() === exam.subject.toString()
        )
      ) {
        const alternateTeacher = findTeacher(exam, null, true);
        if (!alternateTeacher) {
          console.error(
            "Unable to resolve subject conflict for invigilators:",
            selectedInvidulators[0]
          );
          throw new ApiError(
            "Unable to resolve subject conflict for invigilators",
            400
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
          subject: exam.subject,
          room: exam.room,
          standard: exam.standard,
        });
        await newDuty.save();

        for (const invigilator of selectedInvidulators) {
          await Teacher.findByIdAndUpdate(invigilator._id, {
            $push: { duties: newDuty._id },
          });
        }
      } catch (err) {
        console.error("Error saving duty or updating teacher:", err.message);
        throw new ApiError("Failed to assign duty. Please try again.", 400);
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
    console.error("Error assigning duties:", error.message);
    throw error;
  }
});
