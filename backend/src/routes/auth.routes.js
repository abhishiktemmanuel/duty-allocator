// Admin Registration
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/authModels/User.js";
import Organization from "../models/authModels/organization.model.js";
import {
  createUser,
  linkExternalAccount,
  switchOrganization,
} from "../services/userManagementService.js";
import authMiddleware from "../middlewares/authMiddleware.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

router.post("/refresh-token", async (req, res) => {
  // Implement token refresh logic here
});

// SuperAdmin Registration
// router.post("/register/superadmin", async (req, res) => {
//   const { name, email, password } = req.body;

//   try {
//     // Check if a super admin already exists
//     const superAdminExists = await User.findOne({ role: "superAdmin" });
//     if (superAdminExists) {
//       return res.status(400).json({ message: "SuperAdmin already exists" });
//     }

//     // Hash the password and create the super admin
//     const hashedPassword = await bcrypt.hash(password, 10);
//     const newSuperAdmin = new User({
//       name,
//       email,
//       password: hashedPassword,
//       role: "superAdmin",
//     });

//     await newSuperAdmin.save();
//     return res
//       .status(201)
//       .json({ message: "SuperAdmin registered successfully" });
//   } catch (error) {
//     console.error("Error registering SuperAdmin:", error);
//     res.status(500).json({ message: "Error registering SuperAdmin", error });
//   }
// });

router.post("/register/admin", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const newOrganization = new Organization({
      name: `${name}'s Organization`,
      adminId: null,
    });

    const savedOrganization = await newOrganization.save();

    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      organizations: [
        { organizationId: savedOrganization._id, status: "Active" },
      ],
    });

    const savedAdmin = await newAdmin.save();

    savedOrganization.adminId = savedAdmin._id;
    await savedOrganization.save();

    return res.status(201).json({
      message: "Admin registered successfully",
      organizationId: savedOrganization._id,
    });
  } catch (error) {
    console.error("Error registering Admin:", error);
    res
      .status(500)
      .json({ message: "Error registering Admin", error: error.message });
  }
});

router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    const activeOrg = user.organizations.find((org) => org.status === "Active");

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizationId: activeOrg ? activeOrg.organizationId : null,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      _id: user._id,
      token,
      role: user.role,
      organizationId: activeOrg ? activeOrg.organizationId : null,
      passwordChangeRequired: user.passwordChangeRequired,
      organizations: user.organizations,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
});

router.post("/logout", (req, res) => {
  res.status(200).json({ message: "Logout successful" });
});

router.post("/link-account", authMiddleware, async (req, res) => {
  try {
    const { provider, externalId } = req.body;
    const updatedUser = await linkExternalAccount(
      req.user.id,
      provider,
      externalId
    );
    res
      .status(200)
      .json({ message: "Account linked successfully", user: updatedUser });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error linking account", error: error.message });
  }
});

router.post("/switch-organization", authMiddleware, async (req, res) => {
  try {
    const { organizationId } = req.body;
    const newOrg = await switchOrganization(req.user.id, organizationId);
    const token = jwt.sign(
      {
        id: req.user.id,
        role: req.user.role,
        organizationId: newOrg.organizationId,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    res
      .status(200)
      .json({
        message: "Organization switched successfully",
        token,
        organizationId: newOrg.organizationId,
      });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error switching organization", error: error.message });
  }
});

export default router;
