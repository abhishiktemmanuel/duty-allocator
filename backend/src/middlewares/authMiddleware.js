import jwt from "jsonwebtoken";
import Subscription from "../models/subscription.model.js";
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Decode token and set decoded data directly to req.user
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: decoded.role,
      organizationId: decoded.organizationId,
    };

    // Check subscription status if the user is an admin
    if (req.user.role === "admin") {
      const activeSubscription = await Subscription.findOne({
        userId: req.user.id,
        status: "active",
      });

      // Allow access to subscription-related endpoints and some other essential routes
      const allowedPaths = [
        "/api/v1/subscriptions/create",
        "/api/v1/subscriptions/status",
        // Add other essential paths here
      ];

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
