//routes/auth.routes.js
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/authModels/User.js";
import Organization from "../models/authModels/organization.model.js";

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

// Admin Registration

router.post("/register/admin", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new organization for the admin
    const newOrganization = new Organization({
      name: `${name}'s Organization`, // Example organization name
      adminId: null, // This will be updated after saving the admin
    });

    const savedOrganization = await newOrganization.save();

    // Create the admin user and link it to the organization
    const newAdmin = new User({
      name,
      email,
      password: hashedPassword,
      role: "admin",
      organizationId: savedOrganization._id,
    });

    const savedAdmin = await newAdmin.save();

    // Update the organization with its admin's ID
    savedOrganization.adminId = savedAdmin._id;
    await savedOrganization.save();

    return res.status(201).json({
      message: "Admin registered successfully",
      organizationId: savedOrganization._id,
    });
  } catch (error) {
    console.error("Error registering Admin:", error);
    res.status(500).json({ message: "Error registering Admin", error });
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
        organizationId: user.role === "admin" ? user._id : user.organizationId,
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
