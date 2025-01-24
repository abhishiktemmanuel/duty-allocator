import { Router } from "express";
import { addExamDate } from "../controllers/schedule.controller.js";
import { registerSubject } from "../controllers/subject.controller.js";

const router = Router();

router.route("/addexam").post(addExamDate);
router.route("/newsubject").post(registerSubject);

export default router;
