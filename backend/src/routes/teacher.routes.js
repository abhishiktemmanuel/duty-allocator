import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler.js";
import multer from "multer";
import {
  registerTeacher,
  getAllTeachers,
  deleteTeacher,
  updateTeacher,
  addBulkTeachers,
  deleteMultipleTeachers,
  mergeTeacherAccount,
  generateMergeUrl,
  disconnectTeacherAccount,
} from "../controllers/teacher.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

// Teacher registration and retrieval
router.route("/newteacher").post(registerTeacher);
router.route("/getteachers").get(getAllTeachers);
router.post("/merge", asyncHandler(mergeTeacherAccount));
router.post("/:teacherId/merge-url", generateMergeUrl);
router.post("/:teacherId/disconnect", disconnectTeacherAccount);

// Bulk upload and multiple delete
router.post("/bulk-teachers", upload.single("file"), addBulkTeachers);
router.delete("/delmultiteachers", deleteMultipleTeachers);

// Teacher deletion and update
router.route("/teacher/:teacherId").delete(deleteTeacher).put(updateTeacher);

export default router;
