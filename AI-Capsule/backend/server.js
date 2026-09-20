require('dotenv').config();
const capsulesRouter = require('./routes/capsules');
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const passport = require('./auth');
const path = require('path');

const db = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(passport.initialize());

// Public health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// Start OAuth login
app.get('/login', passport.authenticate('github', { session: false }));

// OAuth callback — issue our own JWT after GitHub confirms identity
app.get('/auth/github/callback',
  (req, res, next) => {
    passport.authenticate('github', { session: false }, (err, user) => {
      if (err) {
        console.error('OAuth callback error:', err.message);
        return res.redirect('/login?error=oauth_failed');
      }
      if (!user) {
        return res.redirect('/login?error=oauth_failed');
      }
      req.user = user;
      next();
    })(req, res, next);
  },
  (req, res) => {
    const token = jwt.sign(
      { id: req.user.id, username: req.user.username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000
    });

    res.redirect(process.env.NODE_ENV === 'production' ? '/dashboard' : 'http://localhost:5000/auth/github/callback');
  }
);

// Logout
app.post('/logout', (req, res) => {
  res.clearCookie('token');
  res.json({ status: 'logged out' });
});

app.listen(PORT, () => {
  console.log(`AI Capsule backend running on port ${PORT}`);
});

// Serve the built React frontend
const frontendPath = path.join(__dirname, '../frontend/dist');
app.use(express.static(frontendPath));

// Catch-all: send index.html for any non-API route (lets React Router handle /, /dashboard)
app.get(/^(?!\/api|\/auth|\/login|\/logout).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

app.use('/api/capsules', capsulesRouter);

