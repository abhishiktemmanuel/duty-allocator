//routes/auth.routes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/authModels/User.js";
import Organization from "../models/authModels/organization.model.js";
import passport from "passport";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

// Google OAuth Initiation
router.get(
  "/auth/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Google OAuth Callback
router.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizations: user.organizations.map((org) => ({
          organizationId: org.organizationId,
          teacherId: org.teacherId,
          status: org.status,
        })),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Redirect to frontend with token
    res.redirect(`${process.env.FRONTEND_URL}/oauth-callback?token=${token}`);
  }
);

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

// Admin Registration

router.post("/register/admin", async (req, res) => {
  const { name, email, password } = req.body;

  // Input validation
  if (!name || !email || !password) {
    return res.status(400).json({ message: "All fields are required." });
  }

  try {
    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new organization for the admin
    const newOrganization = new Organization({
      name: `${name}'s Organization`,
      adminId: null, // This will be updated after saving the admin
    });

    const savedOrganization = await newOrganization.save();

    // Create the admin user and link it to the organization
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      organizations: [
        {
          organizationId: savedOrganization._id,
          status: "Active",
          joinedAt: new Date(),
        },
      ],
    });

    const savedAdmin = await newAdmin.save();

    // Update the organization with its admin's ID
    savedOrganization.adminId = savedAdmin._id;
    await savedOrganization.save();

    // Generate JWT token
    const token = jwt.sign(
      {
        id: savedAdmin._id,
        role: savedAdmin.role,
        organizations: [
          {
            organizationId: savedOrganization._id,
            status: "Active",
          },
        ],
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    return res.status(201).json({
      message: "Admin registered successfully",
      token,
      organizationId: savedOrganization._id,
    });
  } catch (error) {
    console.error("Error registering Admin:", error);
    if (error.code === 11000) {
      // MongoDB duplicate key error
      return res.status(400).json({ message: "Email already in use." });
    }
    res
      .status(500)
      .json({ message: "Error registering Admin", error: error.message });
  }
});

// Login a user

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

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizations: user.organizations.map((org) => ({
          organizationId: org.organizationId,
          teacherId: org.teacherId,
          status: org.status,
        })),
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      _id: user._id,
      token,
      role: user.role,
      organizationId: user.role === "admin" ? user._id : user.organizationId,
      passwordChangeRequired: user.passwordChangeRequired,
    });
  } catch (error) {
    console.error("Error logging in:", error);
    res.status(500).json({ message: "Error logging in", error });
  }
});

// Logout a user (optional server-side logic)
router.post("/logout", (req, res) => {
  // For JWT-based authentication, logout is typically handled on the client side by deleting the token.
  res.status(200).json({ message: "Logout successful" });
});

export default router;

// Add these routes after your existing routes

// Password Update Route
router.post("/update-password", async (req, res) => {
  const { userId, currentPassword, newPassword } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    // Hash and update new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    user.passwordChangeRequired = false;
    await user.save();

    res.status(200).json({ message: "Password updated successfully" });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ message: "Error updating password", error });
  }
});

// Password Reset Request Route
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate password reset token
    const resetToken = jwt.sign({ userId: user._id }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // In a production environment, you would:
    // 1. Save the reset token and its expiry in the database
    // 2. Send an email to the user with a reset link containing the token

    // For demonstration, we'll just return the token
    res.status(200).json({
      message: "Password reset instructions sent",
      resetToken, // In production, remove this
    });
  } catch (error) {
    console.error("Error requesting password reset:", error);
    res.status(500).json({ message: "Error requesting password reset", error });
  }
});

// Password Reset Confirmation Route
router.post("/reset-password", async (req, res) => {
  const { resetToken, newPassword } = req.body;

  try {
    // Verify reset token
    const decoded = jwt.verify(resetToken, JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Hash and update new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordChangeRequired = false;
    await user.save();

    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      return res
        .status(400)
        .json({ message: "Invalid or expired reset token" });
    }
    console.error("Error resetting password:", error);
    res.status(500).json({ message: "Error resetting password", error });
  }
});

router.post("/merge-account", async (req, res) => {
  try {
    const { token } = req.body;
    const { teacherId, organizationId } = jwt.verify(token, JWT_SECRET);

    const user = await User.findById(req.user.id);
    const existingConnection = user.organizations.find(
      (org) =>
        org.organizationId.equals(organizationId) &&
        org.teacherId.equals(teacherId)
    );

    if (existingConnection) {
      return res.status(400).json({ message: "Account already merged" });
    }

    user.organizations.push({
      organizationId,
      teacherId,
      status: "Active",
      joinedAt: new Date(),
    });

    await user.save();
    res.status(200).json({ message: "Account merged successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error merging account", error });
  }
});

router.post("/request-merge", async (req, res) => {
  try {
    const { teacherId } = req.body;
    const mergeToken = jwt.sign(
      { teacherId, organizationId: req.orgContext.orgId },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    // Send merge token to teacher via email/sms
    // Implement notification logic

    res.status(200).json({ message: "Merge request sent", mergeToken });
  } catch (error) {
    res.status(500).json({ message: "Error sending merge request", error });
  }
});
