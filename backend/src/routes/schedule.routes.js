import { Router } from "express";
import {
  addExamDate,
  getAllExamSchedules,
  editExamSchedule,
  deleteExamSchedule,
  addBulkExamSchedules,
} from "../controllers/schedule.controller.js";

const router = Router();

router.route("/addexam").post(addExamDate);
router.route("/getexams").get(getAllExamSchedules);
router.route("/bulk").post(addBulkExamSchedules);
// New routes for edit and delete
router.route("/exam/:examId").put(editExamSchedule).delete(deleteExamSchedule);

export default router;
