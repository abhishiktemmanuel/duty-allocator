const organizationAuth = (requiredRole) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    if (req.user.role === "superAdmin") {
      return next(); // Super admin has access to everything
    }

    if (req.user.role !== requiredRole) {
      return res.status(403).json({ message: "Insufficient permissions" });
    }

    // For admins, check if they belong to the organization
    if (requiredRole === "admin") {
      const organizationId = req.params.id || req.body.organizationId;
      if (
        !req.user.organizations.some(
          (org) =>
            org.organizationId.toString() === organizationId &&
            org.status === "Active"
        )
      ) {
        return res
          .status(403)
          .json({ message: "You don't have access to this organization" });
      }
    }

    next();
  };
};

export default organizationAuth;
