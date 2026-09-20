const express = require('express');
const router = express.Router();

// Landing page
router.get('/', (req, res) => {
  if (req.session && req.session.user) {
    if (req.session.user.role === 'admin') {
      return res.redirect('/admin/dashboard');
    }
    return res.redirect('/student/dashboard');
  }
  res.render('index', { title: 'Welcome — Hostel Management System' });
});

module.exports = router;
