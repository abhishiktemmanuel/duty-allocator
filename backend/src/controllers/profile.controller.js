// src/controllers/profile.controller.js
import { User } from "../models/authModels/User.js";
import { getSubscriptionStatus } from "./subscription.controller.js";

export const getProfileDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");

    // Call getSubscriptionStatus as a function, not as an Express route handler
    const subscriptionRes = await getSubscriptionStatus({
      user: { id: userId },
    });

    res.status(200).json({
      success: true,
      data: {
        user,
        subscription: subscriptionRes.hasActiveSubscription
          ? subscriptionRes.data
          : null,
      },
    });
  } catch (error) {
    console.error("Error fetching profile details:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};

export const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, email },
      { new: true }
    ).select("-password");

    res.status(200).json({ success: true, data: updatedUser });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ success: false, error: error.message });
  }
};
