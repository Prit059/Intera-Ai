// passportConfig.js   (example filename)
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../Models/User');   // adjust the path if needed

passport.serializeUser((user, done) => {
  // store minimal info in session
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  // fetch full user by id from DB if needed
  // e.g. User.findById(id).then(user => done(null, user));
  done(null, { id }); // demo only
});

passport.use(new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:"/auth/google/callback"
    // callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      let user = await User.findOne({ googleId: profile.id });

      if (!user) {
        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
          user.googleId = profile.id;
          await user.save();
        } else {
          user = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            googleId: profile.id,
            profileImageUrl: profile.photos[0]?.value || null,
          });
        }
      }

      return done(null, user);   
    } catch (err) {
      return done(err);
    }
  }
));