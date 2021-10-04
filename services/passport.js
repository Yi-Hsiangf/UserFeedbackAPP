const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const mongoose = require('mongoose');
const keys = require('../config/keys');
const User = mongoose.model('users'); // model class, can create instance

passport.serializeUser((user, done) => {
  done(null, user.id) // id given by mongodb
});

passport.deserializeUser((id, done) => {
  User.findById(id).then(user => {
      done(null, user)
    })
})

passport.use(new GoogleStrategy(
  {
  clientID: keys.googleClientID,
  clientSecret: keys.googleClientSecret,
  callbackURL: '/auth/google/callback', //route that user would send to, after grants permission
  proxy: true
  },
  async (accessToken, refreshToken, profile, done) => {
    const existingUser =  await User.findOne({googleId: profile.id});
        if(existingUser) {
          // already have ar record with the given profile ID
          done(null, existingUser); // no error, user record
        }
        else {
          // create nuew instance for user
          const user = await new User({googleId: profile.id}).save() // save to db
          done(null, user)
        }
  })

);
