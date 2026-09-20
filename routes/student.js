const express = require('express');
const router = express.Router();
const { isLoggedIn, isStudent } = require('../middleware/auth');
const Block = require('../models/Block');
const Room = require('../models/Room');
const RoomRequest = require('../models/RoomRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');

// All student routes require login + student role
router.use(isLoggedIn, isStudent);

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    // Find student's current room
    const currentRoom = await Room.findOne({ occupants: req.session.user._id })
      .populate('block')
      .populate('occupants', 'name email studentId');

    // Get recent requests
    const recentRoomRequest = await RoomRequest.findOne({ student: req.session.user._id })
      .sort('-createdAt')
      .populate('allocatedRoom');

    const pendingMaintenance = await MaintenanceRequest.countDocuments({
      student: req.session.user._id,
      status: { $in: ['pending', 'in_progress'] }
    });

    const pendingRoomChange = await RoomChangeRequest.findOne({
      student: req.session.user._id,
      status: 'pending'
    });

    res.render('student/dashboard', {
      title: 'Student Dashboard',
      currentRoom,
      recentRoomRequest,
      pendingMaintenance,
      pendingRoomChange
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOM REQUEST
// ═══════════════════════════════════════════════════════════════════════════
router.get('/request-room', async (req, res) => {
  try {
    // Check if student already has a room
    const existingRoom = await Room.findOne({ occupants: req.session.user._id });
    if (existingRoom) {
      req.flash('error', 'You already have a room allocated. Use room change if you want a different room.');
      return res.redirect('/student/dashboard');
    }

    // Check for pending request
    const pendingRequest = await RoomRequest.findOne({
      student: req.session.user._id,
      status: 'pending'
    });

    const blocks = await Block.find().sort('name');
    const myRequests = await RoomRequest.find({ student: req.session.user._id })
      .populate('preferredBlock')
      .populate({ path: 'allocatedRoom', populate: { path: 'block' } })
      .sort('-createdAt');

    res.render('student/request-room', {
      title: 'Request Room',
      blocks,
      pendingRequest,
      myRequests
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load page.');
    res.redirect('/student/dashboard');
  }
});

router.post('/request-room', async (req, res) => {
  try {
    // Check if student already has a room
    const existingRoom = await Room.findOne({ occupants: req.session.user._id });
    if (existingRoom) {
      req.flash('error', 'You already have a room allocated.');
      return res.redirect('/student/dashboard');
    }

    // Check for pending request
    const pendingRequest = await RoomRequest.findOne({
      student: req.session.user._id,
      status: 'pending'
    });
    if (pendingRequest) {
      req.flash('error', 'You already have a pending room request.');
      return res.redirect('/student/request-room');
    }

    const { preferredBlock, preferredRoomType } = req.body;
    await RoomRequest.create({
      student: req.session.user._id,
      preferredBlock: preferredBlock || undefined,
      preferredRoomType: preferredRoomType || undefined
    });

    req.flash('success', 'Room request submitted successfully! The admin will review it shortly.');
    res.redirect('/student/request-room');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to submit request.');
    res.redirect('/student/request-room');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MY ROOM
// ═══════════════════════════════════════════════════════════════════════════
router.get('/my-room', async (req, res) => {
  try {
    const currentRoom = await Room.findOne({ occupants: req.session.user._id })
      .populate('block')
      .populate('occupants', 'name email studentId phone');

    res.render('student/my-room', {
      title: 'My Room',
      currentRoom
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load room info.');
    res.redirect('/student/dashboard');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOM CHANGE REQUEST
// ═══════════════════════════════════════════════════════════════════════════
router.get('/room-change', async (req, res) => {
  try {
    const currentRoom = await Room.findOne({ occupants: req.session.user._id }).populate('block');
    if (!currentRoom) {
      req.flash('error', 'You need to have a room before requesting a change.');
      return res.redirect('/student/dashboard');
    }

    const blocks = await Block.find().sort('name');
    const myRequests = await RoomChangeRequest.find({ student: req.session.user._id })
      .populate({ path: 'currentRoom', populate: { path: 'block' } })
      .populate({ path: 'newRoom', populate: { path: 'block' } })
      .sort('-createdAt');

    const pendingRequest = await RoomChangeRequest.findOne({
      student: req.session.user._id,
      status: 'pending'
    });

    res.render('student/room-change', {
      title: 'Room Change Request',
      currentRoom,
      blocks,
      myRequests,
      pendingRequest
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load page.');
    res.redirect('/student/dashboard');
  }
});

router.post('/room-change', async (req, res) => {
  try {
    const currentRoom = await Room.findOne({ occupants: req.session.user._id });
    if (!currentRoom) {
      req.flash('error', 'You need to have a room first.');
      return res.redirect('/student/dashboard');
    }

    const pendingRequest = await RoomChangeRequest.findOne({
      student: req.session.user._id,
      status: 'pending'
    });
    if (pendingRequest) {
      req.flash('error', 'You already have a pending room change request.');
      return res.redirect('/student/room-change');
    }

    const { preferredBlock, preferredRoomType, reason } = req.body;
    if (!reason || reason.trim().length === 0) {
      req.flash('error', 'Please provide a reason for the room change.');
      return res.redirect('/student/room-change');
    }

    await RoomChangeRequest.create({
      student: req.session.user._id,
      currentRoom: currentRoom._id,
      preferredBlock: preferredBlock || undefined,
      preferredRoomType: preferredRoomType || undefined,
      reason: reason.trim()
    });

    req.flash('success', 'Room change request submitted successfully!');
    res.redirect('/student/room-change');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to submit request.');
    res.redirect('/student/room-change');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/maintenance', async (req, res) => {
  try {
    const currentRoom = await Room.findOne({ occupants: req.session.user._id }).populate('block');
    const myRequests = await MaintenanceRequest.find({ student: req.session.user._id })
      .populate({ path: 'room', populate: { path: 'block' } })
      .sort('-createdAt');

    res.render('student/maintenance', {
      title: 'Maintenance Requests',
      currentRoom,
      myRequests
    });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load page.');
    res.redirect('/student/dashboard');
  }
});

router.post('/maintenance', async (req, res) => {
  try {
    const currentRoom = await Room.findOne({ occupants: req.session.user._id });
    if (!currentRoom) {
      req.flash('error', 'You need to have a room to submit a maintenance request.');
      return res.redirect('/student/dashboard');
    }

    const { category, description } = req.body;
    if (!category || !description || description.trim().length === 0) {
      req.flash('error', 'Category and description are required.');
      return res.redirect('/student/maintenance');
    }

    await MaintenanceRequest.create({
      student: req.session.user._id,
      room: currentRoom._id,
      category,
      description: description.trim()
    });

    req.flash('success', 'Maintenance request submitted successfully!');
    res.redirect('/student/maintenance');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to submit request.');
    res.redirect('/student/maintenance');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MESS MENU (View)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/mess-menu', async (req, res) => {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menu = await MessMenu.find();

    const menuByDay = {};
    days.forEach(day => {
      menuByDay[day] = menu.find(m => m.day === day) || { day, breakfast: '', lunch: '', snacks: '', dinner: '' };
    });

    res.render('student/mess-menu', { title: 'Mess Menu', menuByDay, days });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load mess menu.');
    res.redirect('/student/dashboard');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// MEAL FEEDBACK
// ═══════════════════════════════════════════════════════════════════════════
router.get('/feedback', async (req, res) => {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const myFeedback = await MealFeedback.find({ student: req.session.user._id })
      .sort('-createdAt')
      .limit(20);

    res.render('student/feedback', { title: 'Meal Feedback', myFeedback, days });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load feedback page.');
    res.redirect('/student/dashboard');
  }
});

router.post('/feedback', async (req, res) => {
  try {
    const { day, mealType, rating, comment } = req.body;
    if (!day || !mealType || !rating) {
      req.flash('error', 'Day, meal type, and rating are required.');
      return res.redirect('/student/feedback');
    }

    await MealFeedback.create({
      student: req.session.user._id,
      day,
      mealType,
      rating: parseInt(rating),
      comment: comment ? comment.trim() : ''
    });

    req.flash('success', 'Feedback submitted successfully! Thank you.');
    res.redirect('/student/feedback');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to submit feedback.');
    res.redirect('/student/feedback');
  }
});

module.exports = router;
