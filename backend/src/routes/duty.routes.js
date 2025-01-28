import { Router } from "express";
import {
  dutySetter,
  getAllDuties,
  updateDuty,
  validateTeacherAssignment,
} from "../controllers/duty.controller.js";

const router = Router();

// Base duty management routes
router.route("/setduty").get(dutySetter);
router.route("/getduties").get(getAllDuties);

// Duty update and validation routes
router.route("/:dutyId").put(updateDuty);
router
  .route("/validate/:dutyId/teacher/:teacherId")
  .get(validateTeacherAssignment);

export default router;
