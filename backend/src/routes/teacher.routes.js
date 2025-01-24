import { Router } from "express";
import {
  registerTeacher,
  getAllTeachers,
} from "../controllers/teacher.controller.js";

const router = Router();

router.route("/newteacher").post(registerTeacher);
router.route("/getteachers").get(getAllTeachers);

export default router;
