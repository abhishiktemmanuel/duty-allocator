import { Router } from "express";
import {
  registerTeacher,
  getAllTeachers,
  deleteTeacher,
  updateTeacher,
} from "../controllers/teacher.controller.js";

const router = Router();

// Teacher registration and retrieval
router.route("/newteacher").post(registerTeacher);
router.route("/getteachers").get(getAllTeachers);

// Teacher deletion and update
router.route("/teacher/:teacherId").delete(deleteTeacher);
router.route("/teacher/:teacherId").put(updateTeacher);

// Alternative cleaner syntax for same routes
// router.route("/teacher/:teacherId")
//   .delete(deleteTeacher)
//   .put(updateTeacher);

export default router;
