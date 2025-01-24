import { Router } from "express";
import {
  registerSchool,
  getAllSchools,
} from "../controllers/school.controller.js";
const router = Router();
router.route("/newschool").post(registerSchool);
router.route("/getschools").get(getAllSchools);
export default router;
