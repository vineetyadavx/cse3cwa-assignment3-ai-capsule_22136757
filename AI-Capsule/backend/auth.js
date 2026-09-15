const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;

passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: process.env.GITHUB_CALLBACK_URL
},
(accessToken, refreshToken, profile, done) => {
  // We only need the GitHub user id and basic profile info.
  const user = {
    id: profile.id,
    username: profile.username,
    displayName: profile.displayName
  };
  return done(null, user);
}));

module.exports = passport;