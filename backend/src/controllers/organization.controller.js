import Organization from "../models/authModels/organization.model.js";
import { User } from "../models/authModels/User.js";

export const createOrganization = async (req, res) => {
  try {
    const { name, adminEmail } = req.body;

    const admin = await User.findOne({ email: adminEmail, role: "admin" });
    if (!admin) {
      return res.status(400).json({ message: "Admin not found" });
    }

    const newOrganization = new Organization({
      name,
      adminId: admin._id,
    });

    const savedOrganization = await newOrganization.save();

    admin.organizations.push({
      organizationId: savedOrganization._id,
      status: "Active",
    });
    await admin.save();

    res.status(201).json(savedOrganization);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating organization", error: error.message });
  }
};

export const getOrganization = async (req, res) => {
  try {
    const organization = await Organization.findById(req.params.id);
    if (!organization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.status(200).json(organization);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error fetching organization", error: error.message });
  }
};

export const updateOrganization = async (req, res) => {
  try {
    const updatedOrganization = await Organization.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedOrganization) {
      return res.status(404).json({ message: "Organization not found" });
    }
    res.status(200).json(updatedOrganization);
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating organization", error: error.message });
  }
};
