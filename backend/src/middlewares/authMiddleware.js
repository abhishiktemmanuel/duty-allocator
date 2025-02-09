import jwt from "jsonwebtoken";
import Subscription from "../models/subscription.model.js";
import { User } from "../models/authModels/User.js";

const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = {
      id: user._id,
      role: user.role,
      organizationId: decoded.organizationId,
      organizations: user.organizations,
    };

    // Check subscription status if the user is an admin
    if (req.user.role === "admin") {
      const activeSubscription = await Subscription.findOne({
        userId: req.user.id,
        status: "active",
      });

      const allowedPaths = [
        "/api/v1/subscriptions/create",
        "/api/v1/subscriptions/status",
        // Add other essential paths here
      ];

      // Uncomment this if you want to enforce subscription checks
      // if (!activeSubscription && !allowedPaths.includes(req.path)) {
      //   return res.status(403).json({
      //     message: "Access denied. No active subscription found.",
      //   });
      // }
    }

    next();
  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(401).json({ message: "Invalid token" });
  }
};

export default authMiddleware;
