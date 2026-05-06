import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import User from "../models/Users.js";

passport.use(new GoogleStrategy({
  clientID: "GOOGLE_CLIENT_ID",
  clientSecret: "GOOGLE_SECRET",
  callbackURL: "/api/auth/google/callback",
}, async (accessToken, refreshToken, profile, done) => {

  let user = await User.findOne({
    email: profile.emails[0].value
  });

  if (!user) {
    user = await User.create({
      name: profile.displayName,
      email: profile.emails[0].value,
    });
  }

  done(null, user);
}));

export default passport;