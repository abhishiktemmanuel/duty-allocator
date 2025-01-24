import { Router } from "express";
import {
  registerSubject,
  getAllSubjects,
} from "../controllers/subject.controller.js";
const router = Router();
router.route("/newsubject").post(registerSubject);
router.route("/getsubjects").get(getAllSubjects);
export default router;
