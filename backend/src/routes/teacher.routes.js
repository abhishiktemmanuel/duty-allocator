import { Router } from "express";
import { registerTeacher } from "../controllers/teacher.controller.js";
import { registerSubject } from "../controllers/subject.controller.js";
import { registerSchool } from "../controllers/school.controller.js";

const router = Router();

router.route("/newteacher").post(registerTeacher);
router.route("/newsubject").post(registerSubject);
router.route("/newschool").post(registerSchool);

export default router;
