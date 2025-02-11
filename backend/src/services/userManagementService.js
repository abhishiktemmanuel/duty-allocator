import { User } from "../models/authModels/User.js";
import bcrypt from "bcrypt";

export const createUser = async (userData) => {
  const { name, email, password, role, organizationId } = userData;

  const hashedPassword = await bcrypt.hash(password, 10);

  const newUser = new User({
    name,
    email,
    password: hashedPassword,
    role,
    organizations: [{ organizationId, status: "Active" }],
  });

  return await newUser.save();
};

export const linkExternalAccount = async (userId, provider, externalId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  user.externalAccounts.push({ provider, externalId });
  return await user.save();
};

export const switchOrganization = async (userId, organizationId) => {
  const user = await User.findById(userId);
  if (!user) {
    throw new Error("User not found");
  }

  const orgIndex = user.organizations.findIndex(
    (org) => org.organizationId.toString() === organizationId
  );
  if (orgIndex === -1) {
    throw new Error("User is not a member of this organization");
  }

  if (user.organizations[orgIndex].status !== "Active") {
    throw new Error("User's membership in this organization is not active");
  }

  // Here you might want to update some session information or return the new active organization
  return user.organizations[orgIndex];
};
