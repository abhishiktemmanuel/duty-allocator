import express from "express";
import {
  createOrganization,
  getOrganization,
  updateOrganization,
} from "../controllers/organization.controller.js";
import authMiddleware from "../middlewares/authMiddleware.js";
import organizationAuth from "../middlewares/organizationAuth.js";

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  organizationAuth("superAdmin"),
  createOrganization
);
router.get("/:id", authMiddleware, organizationAuth("admin"), getOrganization);
router.put(
  "/:id",
  authMiddleware,
  organizationAuth("admin"),
  updateOrganization
);

export default router;
