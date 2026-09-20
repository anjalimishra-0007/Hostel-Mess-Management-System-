// Authentication & Authorization Middleware

module.exports.isLoggedIn = (req, res, next) => {
  if (req.session && req.session.user) {
    return next();
  }
  req.flash('error', 'You must be logged in to access this page.');
  return res.redirect('/login');
};

module.exports.isAdmin = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return next();
  }
  req.flash('error', 'Access denied. Admin privileges required.');
  if (req.session && req.session.user && req.session.user.role === 'student') {
    return res.redirect('/student/dashboard');
  }
  return res.redirect('/login');
};

module.exports.isStudent = (req, res, next) => {
  if (req.session && req.session.user && req.session.user.role === 'student') {
    return next();
  }
  req.flash('error', 'Access denied. Student access only.');
  if (req.session && req.session.user && req.session.user.role === 'admin') {
    return res.redirect('/admin/dashboard');
  }
  return res.redirect('/login');
};

module.exports.setLocals = (req, res, next) => {
  res.locals.currentUser = req.session.user || null;
  res.locals.success = req.flash('success');
  res.locals.error = req.flash('error');
  next();
};

