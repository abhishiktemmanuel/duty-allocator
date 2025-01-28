import { fetchAllTeachers } from "./teacher.controller.js";
import { fetchAllExamSchedules } from "./schedule.controller.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";

const dutySetter = async (req, res) => {
  const session = await req.models.Duty.startSession();
  session.startTransaction();

  try {
    const Duty = req.models.Duty;
    const Teacher = req.models.Teacher;

    // Clear existing duties
    await Duty.deleteMany({}, { session });

    const teachersData = await fetchAllTeachers(req.models);
    const examSchedulesData = await fetchAllExamSchedules(req.models);

    if (!teachersData?.length) {
      throw new ApiError(400, "No teachers available");
    }

    if (!examSchedulesData?.length) {
      throw new ApiError(400, "No exam schedules available");
    }

    const teachers = teachersData.map((teacher) => ({
      _id: teacher._id,
      name: teacher.name,
      subjects: teacher.subjects,
      school: teacher.school,
      duties: teacher.duties.map((duty) => ({
        _id: duty._id,
        date: duty.date,
        shift: duty.shift,
      })),
    }));

    const examSchedules = examSchedulesData.map((examSchedule) => ({
      _id: examSchedule._id,
      subject: examSchedule.subject,
      date: examSchedule.date,
      shift: examSchedule.shift,
      rooms: examSchedule.rooms,
      standard: examSchedule.standard,
    }));

    let tempTeachers = [...teachers];
    const unassignedExams = [];
    const assignedDuties = [];

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
      let dutyAssignmentFailed = false;

      try {
        // Try to find two eligible teachers
        for (let i = 0; i < 2; i++) {
          let teacher =
            findTeacher(exam, selectedInvidulators[0]) ||
            findTeacher(exam, selectedInvidulators[0], true);

          if (!teacher) {
            dutyAssignmentFailed = true;
            break;
          }
          selectedInvidulators.push(teacher);
        }

        if (dutyAssignmentFailed) {
          // Create unassigned duty
          const newDuty = new Duty({
            date: exam.date,
            shift: exam.shift,
            subject: exam.subject._id,
            room: exam.rooms[0],
            standard: exam.standard,
            status: "UNASSIGNED",
          });
          await newDuty.save({ session });
          unassignedExams.push(exam);
          continue;
        }

        // Create assigned duty
        const newDuty = new Duty({
          date: exam.date,
          shift: exam.shift,
          invidulator1: selectedInvidulators[0]._id,
          invidulator2: selectedInvidulators[1]._id,
          subject: exam.subject._id,
          room: exam.rooms[0],
          standard: exam.standard,
          status: "ASSIGNED",
        });
        await newDuty.save({ session });

        // Update teachers' duties
        await Promise.all(
          selectedInvidulators.map((invigilator) =>
            Teacher.findByIdAndUpdate(
              invigilator._id,
              { $push: { duties: newDuty._id } },
              { session }
            )
          )
        );

        assignedDuties.push(newDuty);
      } catch (err) {
        console.error("Error in duty assignment:", err);
        unassignedExams.push(exam);
      }
    }

    await session.commitTransaction();

    const allDuties = await Duty.find({})
      .populate("invidulator1", "name")
      .populate("invidulator2", "name")
      .populate("subject", "name")
      .sort({ date: 1, shift: 1 });

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          duties: allDuties,
          unassignedExams: unassignedExams.length ? unassignedExams : [],
          assignedCount: assignedDuties.length,
          unassignedCount: unassignedExams.length,
        },
        `${assignedDuties.length} duties assigned successfully. ${
          unassignedExams.length
            ? `${unassignedExams.length} exams could not be assigned.`
            : ""
        }`
      )
    );
  } catch (error) {
    await session.abortTransaction();
    console.error("Error assigning duties:", error);
    return res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  } finally {
    session.endSession();
  }
};

const getAllDuties = async (req, res) => {
  try {
    const Duty = req.models.Duty;
    const duties = await Duty.find({})
      .populate("invidulator1", "name")
      .populate("invidulator2", "name")
      .populate("subject", "name")
      .sort({ date: 1, shift: 1 });

    return res
      .status(200)
      .json(new ApiResponse(200, duties, "Duties retrieved successfully"));
  } catch (error) {
    console.error("Error fetching duties:", error);
    return res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  }
};

const updateDuty = async (req, res) => {
  const session = await req.models.Duty.startSession();
  session.startTransaction();

  try {
    const Duty = req.models.Duty;
    const Teacher = req.models.Teacher;
    const { dutyId } = req.params;
    const updateData = req.body;

    // Get the old duty to handle teacher duty references
    const oldDuty = await Duty.findById(dutyId);
    if (!oldDuty) {
      throw new ApiError(404, "Duty not found");
    }

    // Remove duty reference from old teachers if they're being replaced
    if (updateData.invidulator1 && oldDuty.invidulator1) {
      await Teacher.findByIdAndUpdate(
        oldDuty.invidulator1,
        { $pull: { duties: dutyId } },
        { session }
      );
    }
    if (updateData.invidulator2 && oldDuty.invidulator2) {
      await Teacher.findByIdAndUpdate(
        oldDuty.invidulator2,
        { $pull: { duties: dutyId } },
        { session }
      );
    }

    // Update the duty
    const updatedDuty = await Duty.findByIdAndUpdate(
      dutyId,
      {
        ...updateData,
        status:
          updateData.invidulator1 && updateData.invidulator2
            ? "ASSIGNED"
            : "UNASSIGNED",
      },
      { new: true, session }
    )
      .populate("invidulator1", "name")
      .populate("invidulator2", "name")
      .populate("subject", "name");

    // Add duty reference to new teachers
    if (updateData.invidulator1) {
      await Teacher.findByIdAndUpdate(
        updateData.invidulator1,
        { $addToSet: { duties: dutyId } },
        { session }
      );
    }
    if (updateData.invidulator2) {
      await Teacher.findByIdAndUpdate(
        updateData.invidulator2,
        { $addToSet: { duties: dutyId } },
        { session }
      );
    }

    await session.commitTransaction();

    return res
      .status(200)
      .json(new ApiResponse(200, updatedDuty, "Duty updated successfully"));
  } catch (error) {
    await session.abortTransaction();
    console.error("Error updating duty:", error);
    return res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  } finally {
    session.endSession();
  }
};

// Function to validate if a teacher can be assigned to a duty
const validateTeacherAssignment = async (req, res) => {
  try {
    const { teacherId, dutyId } = req.params;
    const Duty = req.models.Duty;
    const Teacher = req.models.Teacher;

    const duty = await Duty.findById(dutyId);
    const teacher = await Teacher.findById(teacherId)
      .populate("subjects")
      .populate("duties");

    if (!duty || !teacher) {
      throw new ApiError(404, "Duty or Teacher not found");
    }

    // Check for subject conflict
    const teachesSubject = teacher.subjects.some(
      (subject) => subject._id.toString() === duty.subject.toString()
    );

    // Check for duty timing conflict
    const hasOverlappingDuty = teacher.duties.some(
      (existingDuty) =>
        existingDuty.date.toISOString().split("T")[0] ===
          duty.date.toISOString().split("T")[0] &&
        existingDuty.shift === duty.shift
    );

    return res.status(200).json(
      new ApiResponse(
        200,
        {
          canBeAssigned: !teachesSubject && !hasOverlappingDuty,
          conflicts: {
            teachesSubject,
            hasOverlappingDuty,
          },
        },
        "Teacher assignment validation completed"
      )
    );
  } catch (error) {
    console.error("Error validating teacher assignment:", error);
    return res.status(error.statusCode || 500).json({
      status: error.statusCode || 500,
      message: error.message || "Internal Server Error",
    });
  }
};

export { dutySetter, getAllDuties, updateDuty, validateTeacherAssignment };
