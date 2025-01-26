import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { User } from "../models/authModels/User.js";
import Organization from "../models/authModels/organization.model.js";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret_key";

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

// End User Registration
router.post("/register/enduser", async (req, res) => {
  const { name, email, password, organizationId } = req.body;

  try {
    // Ensure that an organizationId is provided
    if (!organizationId) {
      return res
        .status(400)
        .json({ message: "Organization ID is required for end users" });
    }

    // Check if the organization exists
    const existingOrganization = await Organization.findById(organizationId);
    if (!existingOrganization) {
      return res.status(404).json({ message: "Invalid Organization ID" });
    }

    // Hash the password and create the end user
    const hashedPassword = await bcrypt.hash(password, 10);
    const newEndUser = new User({
      name,
      email,
      password: hashedPassword,
      role: "endUser",
      organizationId,
    });

    await newEndUser.save();
    return res
      .status(201)
      .json({ message: "End user registered successfully" });
  } catch (error) {
    console.error("Error registering End User:", error);
    res.status(500).json({ message: "Error registering End User", error });
  }
});

// Login a user
// Login a user
router.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    // Find user by email (username is treated as email)
    const user = await User.findOne({ email: username });

    if (!user) {
      return res.status(400).json({ message: "Invalid user" });
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: "Invalid password" });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
        organizationId: user._id || user.organizationId, // Include organizationId in token payload
      },
      JWT_SECRET,
      { expiresIn: "1h" }
    );
    console.log(user._id || user.organizationId);

    // Respond with token and organizationId
    res.status(200).json({
      token,
      organizationId: user._id || user.organizationId, // Include organizationId in response
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
