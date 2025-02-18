// src/controllers/profile.controller.js
import { User } from "../models/authModels/User.js";
import { getSubscriptionStatus } from "./subscription.controller.js";

const formatSubscriptionData = (subscription) => {
  if (!subscription) return null;

  return {
    status: subscription.status,
    plan: {
      isActive: subscription.isActive,
      daysRemaining: subscription.daysRemaining,
      validTill: new Date(subscription.currentEnd).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      nextBilling: new Date(subscription.chargeAt).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    },
    payment: subscription.paymentDetails
      ? {
          amount: `₹${(subscription.paymentDetails.amount / 100).toFixed(2)}`,
          method: subscription.paymentDetails.method.toUpperCase(),
          status: subscription.paymentDetails.status,
        }
      : null,
  };
};

const formatUserData = (user) => {
  return {
    name: user.name,
    email: user.email,
    role: user.role,
    joinedOn: new Date(user.createdAt).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
  };
};

export const getProfileDetails = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId).select("-password");
    const subscriptionRes = await getSubscriptionStatus({
      user: { id: userId },
    });

    const formattedResponse = {
      success: true,
      data: {
        profile: formatUserData(user),
        subscription: subscriptionRes.hasActiveSubscription
          ? formatSubscriptionData(subscriptionRes.data)
          : null,
      },
    };

    res.status(200).json(formattedResponse);
  } catch (error) {
    console.error("Error fetching profile details:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch profile details",
    });
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

    res.status(200).json({
      success: true,
      data: formatUserData(updatedUser),
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update profile",
    });
  }
};

// // src/controllers/profile.controller.js
// import { User } from "../models/authModels/User.js";
// import { getSubscriptionStatus } from "./subscription.controller.js";

// export const getProfileDetails = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId).select("-password");

//     // Call getSubscriptionStatus as a function, not as an Express route handler
//     const subscriptionRes = await getSubscriptionStatus({
//       user: { id: userId },
//     });
//     console.log("Profile details:", user, subscriptionRes.data),
//       res.status(200).json({
//         success: true,
//         data: {
//           user,
//           subscription: subscriptionRes.hasActiveSubscription
//             ? subscriptionRes.data
//             : null,
//         },
//       });
//   } catch (error) {
//     console.error("Error fetching profile details:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };

// export const updateProfile = async (req, res) => {
//   try {
//     const userId = req.user.id;
//     const { name, email } = req.body;
//     const updatedUser = await User.findByIdAndUpdate(
//       userId,
//       { name, email },
//       { new: true }
//     ).select("-password");

//     res.status(200).json({ success: true, data: updatedUser });
//   } catch (error) {
//     console.error("Error updating profile:", error);
//     res.status(500).json({ success: false, error: error.message });
//   }
// };
