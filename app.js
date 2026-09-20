require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const expressLayouts = require('express-ejs-layouts');
const methodOverride = require('method-override');
const morgan = require('morgan');
const path = require('path');

// Import middleware
const { setLocals } = require('./middleware/auth');

// Import routes
const indexRoutes = require('./routes/index');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const studentRoutes = require('./routes/student');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'hostel_management_session_secret_2026';
const MONGODB_URI = process.env.MONGODB_URI;

// ─── Trust Proxy (Required for Render, Heroku, etc.) ───────────────────────
app.set('trust proxy', 1);

// ─── Database Connection ────────────────────────────────────────────────────
if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI is not defined! Please configure MONGODB_URI in your environment variables.');
} else {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('✅ MongoDB connected successfully'))
    .catch(err => console.error('❌ MongoDB connection error:', err.message));
}

// ─── View Engine ────────────────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(expressLayouts);
app.set('layout', 'layout');

// ─── Middleware ─────────────────────────────────────────────────────────────
app.use(morgan('dev'));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

// ─── Session ────────────────────────────────────────────────────────────────
const sessionConfig = {
  secret: SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 * 7 // 1 week
  }
};

if (MONGODB_URI) {
  sessionConfig.store = MongoStore.create({
    mongoUrl: MONGODB_URI,
    touchAfter: 24 * 3600 // lazy update session every 24 hours
  });
}

app.use(session(sessionConfig));

// ─── Flash Messages ────────────────────────────────────────────────────────
app.use(flash());

// ─── Set Locals (currentUser, flash) ───────────────────────────────────────
app.use(setLocals);

// ─── Routes ─────────────────────────────────────────────────────────────────
app.use('/', indexRoutes);
app.use('/', authRoutes);
app.use('/admin', adminRoutes);
app.use('/student', studentRoutes);

// ─── 404 Handler ────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('error', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.',
    statusCode: 404
  });
});

// ─── Error Handler ──────────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('🚨 Application Error:', err.stack || err);
  res.status(500).render('error', {
    title: 'Server Error',
    message: err.message || 'Something went wrong on our end.',
    statusCode: 500
  });
});

// ─── Start Server ───────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🏠 Hostel Management System running at http://localhost:${PORT}`);
});

