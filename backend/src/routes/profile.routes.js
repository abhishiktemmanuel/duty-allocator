// src/routes/profile.routes.js
import express from "express";
import {
  getProfileDetails,
  updateProfile,
} from "../controllers/profile.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/details", authMiddleware, getProfileDetails);
router.put("/update", authMiddleware, updateProfile);

export default router;
