import { Router } from "express";
import multer from "multer";
import {
  registerTeacher,
  getAllTeachers,
  deleteTeacher,
  updateTeacher,
  addBulkTeachers,
  deleteMultipleTeachers,
} from "../controllers/teacher.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Teacher registration and retrieval
router.route("/newteacher").post(registerTeacher);
router.route("/getteachers").get(getAllTeachers);

// Bulk upload and multiple delete
router.post("/bulk-teachers", upload.single("file"), addBulkTeachers);
router.delete("/delmultiteachers", deleteMultipleTeachers);

// Teacher deletion and update
router.route("/teacher/:teacherId").delete(deleteTeacher).put(updateTeacher);

export default router;
