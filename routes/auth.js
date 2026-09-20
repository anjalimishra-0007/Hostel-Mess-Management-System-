const express = require('express');
const router = express.Router();
const User = require('../models/User');

// ─── GET /register ──────────────────────────────────────────────────────────
router.get('/register', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    return res.redirect('/student/dashboard');
  }
  res.render('auth/register', { title: 'Register' });
});

// ─── POST /register ─────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, confirmPassword, phone, studentId, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      req.flash('error', 'Name, email, and password are required.');
      return res.redirect('/register');
    }
    if (password !== confirmPassword) {
      req.flash('error', 'Passwords do not match.');
      return res.redirect('/register');
    }
    if (password.length < 6) {
      req.flash('error', 'Password must be at least 6 characters.');
      return res.redirect('/register');
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.flash('error', 'An account with this email already exists.');
      return res.redirect('/register');
    }

    // Create user
    const user = new User({
      name,
      email,
      password,
      phone,
      studentId: role === 'student' ? studentId : undefined,
      role: role || 'student'
    });
    await user.save();

    // Auto-login after registration
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId
    };

    req.session.save((saveErr) => {
      if (saveErr) console.error('Session save error on register:', saveErr);
      req.flash('success', `Welcome, ${user.name}! Your account has been created.`);
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }
      return res.redirect('/student/dashboard');
    });
  } catch (err) {
    console.error('Registration error:', err);
    req.flash('error', 'Registration failed. Please try again.');
    return res.redirect('/register');
  }
});

// ─── GET /login ─────────────────────────────────────────────────────────────
router.get('/login', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
    return res.redirect('/student/dashboard');
  }
  res.render('auth/login', { title: 'Login' });
});

// ─── POST /login ────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(`[AUTH] Login attempt for email: "${email}"`);

    if (!email || !password) {
      req.flash('error', 'Email and password are required.');
      return res.redirect('/login');
    }

    const user = await User.findOne({ email });
    if (!user) {
      console.log(`[AUTH] User not found for email: "${email}"`);
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      console.log(`[AUTH] Invalid password for email: "${email}"`);
      req.flash('error', 'Invalid email or password.');
      return res.redirect('/login');
    }

    // Store user in session
    req.session.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      studentId: user.studentId
    };

    console.log(`[AUTH] Login success: ${user.name} (${user.role})`);

    req.session.save((saveErr) => {
      if (saveErr) console.error('Session save error on login:', saveErr);
      req.flash('success', `Welcome back, ${user.name}!`);
      if (user.role === 'admin') {
        return res.redirect('/admin/dashboard');
      }
      return res.redirect('/student/dashboard');
    });
  } catch (err) {
    console.error('Login error:', err);
    req.flash('error', 'Login failed. Please try again.');
    return res.redirect('/login');
  }
});

// ─── GET /logout ────────────────────────────────────────────────────────────
router.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('connect.sid');
    res.redirect('/login');
  });
});

module.exports = router;

