export const requireVerification = (req, res, next) => {
  if (req.user.role === "endUser" && !req.user.verified) {
    return res.status(403).json({
      message: "Email verification required",
      code: "VERIFICATION_REQUIRED",
    });
  }
  next();
};

export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      verificationToken: req.params.token,
      verificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    user.verified = true;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error verifying email", error });
  }
};
