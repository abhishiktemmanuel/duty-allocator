import { Router } from "express";
import {
  addExamDate,
  getAllExamSchedules,
} from "../controllers/schedule.controller.js";

const router = Router();

router.route("/addexam").post(addExamDate);
router.route("/getexams").get(getAllExamSchedules);

export default router;
