import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { User } from "../models/authModels/User.js";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email = profile.emails[0].value;
        const existingUser = await User.findOne({
          $or: [{ "externalAccounts.externalId": profile.id }, { email }],
        });

        if (existingUser) {
          // Merge logic
          const mergeToken = localStorage.getItem("mergeToken");
          if (mergeToken) {
            const { organizationId, teacherId } = jwt.verify(
              mergeToken,
              JWT_SECRET
            );
            existingUser.organizations.push({
              organizationId,
              teacherId,
              status: "Active",
              joinedAt: new Date(),
            });
            await existingUser.save();
          }

          // Add Google account if not already linked
          if (
            !existingUser.externalAccounts.some(
              (acc) => acc.provider === "Google"
            )
          ) {
            existingUser.externalAccounts.push({
              provider: "Google",
              externalId: profile.id,
            });
            await existingUser.save();
          }
          return done(null, existingUser);
        }

        // Create new user
        const newUser = new User({
          name: profile.displayName,
          email,
          role: "endUser",
          verified: profile.emails[0].verified,
          externalAccounts: [
            {
              provider: "Google",
              externalId: profile.id,
            },
          ],
        });

        await newUser.save();
        return done(null, newUser);
      } catch (error) {
        return done(error, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});
