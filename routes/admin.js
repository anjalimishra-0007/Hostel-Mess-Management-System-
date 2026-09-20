const express = require('express');
const router = express.Router();
const { isLoggedIn, isAdmin } = require('../middleware/auth');
const Block = require('../models/Block');
const Room = require('../models/Room');
const User = require('../models/User');
const RoomRequest = require('../models/RoomRequest');
const MaintenanceRequest = require('../models/MaintenanceRequest');
const RoomChangeRequest = require('../models/RoomChangeRequest');
const MessMenu = require('../models/MessMenu');
const MealFeedback = require('../models/MealFeedback');

// All admin routes require login + admin role
router.use(isLoggedIn, isAdmin);

// ═══════════════════════════════════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════════════════════════════════
router.get('/dashboard', async (req, res) => {
  try {
    const [
      totalStudents,
      totalBlocks,
      totalRooms,
      pendingRoomRequests,
      pendingMaintenance,
      pendingRoomChanges,
      rooms
    ] = await Promise.all([
      User.countDocuments({ role: 'student' }),
      Block.countDocuments(),
      Room.countDocuments(),
      RoomRequest.countDocuments({ status: 'pending' }),
      MaintenanceRequest.countDocuments({ status: { $in: ['pending', 'in_progress'] } }),
      RoomChangeRequest.countDocuments({ status: 'pending' }),
      Room.find().populate('block')
    ]);

    // Calculate occupancy stats
    const totalBeds = rooms.reduce((sum, r) => sum + (r.capacity || 0), 0);
    const occupiedBeds = rooms.reduce((sum, r) => sum + (Array.isArray(r.occupants) ? r.occupants.length : 0), 0);
    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

    // Block-wise stats
    const blocks = await Block.find();
    const blockStats = [];
    for (const block of blocks) {
      const blockRooms = rooms.filter(r => {
        if (!r.block) return false;
        const bId = r.block._id ? r.block._id.toString() : r.block.toString();
        return bId === block._id.toString();
      });
      const bBeds = blockRooms.reduce((s, r) => s + (r.capacity || 0), 0);
      const bOccupied = blockRooms.reduce((s, r) => s + (Array.isArray(r.occupants) ? r.occupants.length : 0), 0);
      blockStats.push({
        name: block.name,
        type: block.type,
        totalRooms: blockRooms.length,
        totalBeds: bBeds,
        occupiedBeds: bOccupied,
        availableBeds: Math.max(0, bBeds - bOccupied),
        occupancyRate: bBeds > 0 ? Math.round((bOccupied / bBeds) * 100) : 0
      });
    }

    res.render('admin/dashboard', {
      title: 'Admin Dashboard',
      totalStudents,
      totalBlocks,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate,
      pendingRoomRequests,
      pendingMaintenance,
      pendingRoomChanges,
      blockStats
    });
  } catch (err) {
    console.error('Admin dashboard error:', err);
    req.flash('error', 'Failed to load dashboard.');
    res.redirect('/');
  }
});

// ═══════════════════════════════════════════════════════════════════════════
// BLOCKS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/blocks', async (req, res) => {
  try {
    const blocks = await Block.find().sort('name');
    res.render('admin/blocks', { title: 'Manage Blocks', blocks });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load blocks.');
    res.redirect('/admin/dashboard');
  }
});

router.post('/blocks', async (req, res) => {
  try {
    const { name, type, description } = req.body;
    await Block.create({ name, type, description });
    req.flash('success', `Block "${name}" created successfully.`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create block. Name may already exist.');
  }
  res.redirect('/admin/blocks');
});

router.post('/blocks/:id/delete', async (req, res) => {
  try {
    // Check if block has rooms
    const roomCount = await Room.countDocuments({ block: req.params.id });
    if (roomCount > 0) {
      req.flash('error', 'Cannot delete block with existing rooms. Remove rooms first.');
      return res.redirect('/admin/blocks');
    }
    await Block.findByIdAndDelete(req.params.id);
    req.flash('success', 'Block deleted successfully.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete block.');
  }
  res.redirect('/admin/blocks');
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOMS MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/rooms', async (req, res) => {
  try {
    const blocks = await Block.find().sort('name');
    let query = {};
    if (req.query.block) query.block = req.query.block;
    if (req.query.status) query.status = req.query.status;
    if (req.query.type) query.type = req.query.type;

    const rooms = await Room.find(query)
      .populate('block')
      .populate('occupants', 'name email studentId')
      .sort('roomNumber');

    res.render('admin/rooms', { title: 'Manage Rooms', rooms, blocks, filters: req.query });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load rooms.');
    res.redirect('/admin/dashboard');
  }
});

router.post('/rooms', async (req, res) => {
  try {
    const { roomNumber, block, type, floor } = req.body;
    const capacityMap = { single: 1, double: 2, triple: 3 };
    const capacity = capacityMap[type] || 1;

    await Room.create({ roomNumber, block, type, capacity, floor: parseInt(floor) || 1 });

    // Update block total rooms
    const roomCount = await Room.countDocuments({ block });
    await Block.findByIdAndUpdate(block, { totalRooms: roomCount });

    req.flash('success', `Room ${roomNumber} created successfully.`);
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to create room. Room number may already exist in this block.');
  }
  res.redirect('/admin/rooms');
});

router.post('/rooms/:id/delete', async (req, res) => {
  try {
    const room = await Room.findById(req.params.id);
    if (!room) {
      req.flash('error', 'Room not found.');
      return res.redirect('/admin/rooms');
    }
    if (room.occupants.length > 0) {
      req.flash('error', 'Cannot delete room with occupants. Remove occupants first.');
      return res.redirect('/admin/rooms');
    }
    const blockId = room.block;
    await Room.findByIdAndDelete(req.params.id);

    // Update block total rooms
    const roomCount = await Room.countDocuments({ block: blockId });
    await Block.findByIdAndUpdate(blockId, { totalRooms: roomCount });

    req.flash('success', 'Room deleted successfully.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to delete room.');
  }
  res.redirect('/admin/rooms');
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOM REQUESTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/requests', async (req, res) => {
  try {
    const requests = await RoomRequest.find()
      .populate('student', 'name email studentId')
      .populate('preferredBlock')
      .populate('allocatedRoom')
      .sort('-createdAt');

    const availableRooms = await Room.find({ status: { $ne: 'full' } })
      .populate('block')
      .sort('roomNumber');

    res.render('admin/requests', { title: 'Room Requests', requests, availableRooms });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load requests.');
    res.redirect('/admin/dashboard');
  }
});

router.post('/requests/:id/approve', async (req, res) => {
  try {
    const { roomId, adminRemarks } = req.body;
    const request = await RoomRequest.findById(req.params.id);
    if (!request || request.status !== 'pending') {
      req.flash('error', 'Request not found or already processed.');
      return res.redirect('/admin/requests');
    }

    const room = await Room.findById(roomId);
    if (!room || room.occupants.length >= room.capacity) {
      req.flash('error', 'Selected room is full or not found.');
      return res.redirect('/admin/requests');
    }

    // Add student to room
    room.occupants.push(request.student);
    await room.save();

    // Update request
    request.status = 'approved';
    request.allocatedRoom = room._id;
    request.adminRemarks = adminRemarks || '';
    await request.save();

    req.flash('success', 'Room request approved and student allocated.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to approve request.');
  }
  res.redirect('/admin/requests');
});

router.post('/requests/:id/reject', async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    await RoomRequest.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      adminRemarks: adminRemarks || 'Request rejected.'
    });
    req.flash('success', 'Room request rejected.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to reject request.');
  }
  res.redirect('/admin/requests');
});

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/maintenance', async (req, res) => {
  try {
    const requests = await MaintenanceRequest.find()
      .populate('student', 'name email studentId')
      .populate({ path: 'room', populate: { path: 'block' } })
      .sort('-createdAt');

    res.render('admin/maintenance', { title: 'Maintenance Requests', requests });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load maintenance requests.');
    res.redirect('/admin/dashboard');
  }
});

router.post('/maintenance/:id/update', async (req, res) => {
  try {
    const { status, adminRemarks } = req.body;
    await MaintenanceRequest.findByIdAndUpdate(req.params.id, {
      status,
      adminRemarks
    });
    req.flash('success', 'Maintenance request updated.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update maintenance request.');
  }
  res.redirect('/admin/maintenance');
});

// ═══════════════════════════════════════════════════════════════════════════
// ROOM CHANGE REQUESTS
// ═══════════════════════════════════════════════════════════════════════════
router.get('/room-changes', async (req, res) => {
  try {
    const requests = await RoomChangeRequest.find()
      .populate('student', 'name email studentId')
      .populate({ path: 'currentRoom', populate: { path: 'block' } })
      .populate('preferredBlock')
      .sort('-createdAt');

    const availableRooms = await Room.find({ status: { $ne: 'full' } })
      .populate('block')
      .sort('roomNumber');

    res.render('admin/room-changes', { title: 'Room Change Requests', requests, availableRooms });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load room change requests.');
    res.redirect('/admin/dashboard');
  }
});

router.post('/room-changes/:id/approve', async (req, res) => {
  try {
    const { roomId, adminRemarks } = req.body;
    const request = await RoomChangeRequest.findById(req.params.id).populate('currentRoom');
    if (!request || request.status !== 'pending') {
      req.flash('error', 'Request not found or already processed.');
      return res.redirect('/admin/room-changes');
    }

    const newRoom = await Room.findById(roomId);
    if (!newRoom || newRoom.occupants.length >= newRoom.capacity) {
      req.flash('error', 'Selected room is full or not found.');
      return res.redirect('/admin/room-changes');
    }

    // Remove student from current room
    const currentRoom = await Room.findById(request.currentRoom._id);
    currentRoom.occupants = currentRoom.occupants.filter(
      occ => occ.toString() !== request.student.toString()
    );
    await currentRoom.save();

    // Add student to new room
    newRoom.occupants.push(request.student);
    await newRoom.save();

    // Update request
    request.status = 'approved';
    request.newRoom = newRoom._id;
    request.adminRemarks = adminRemarks || '';
    await request.save();

    req.flash('success', 'Room change approved. Student moved to new room.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to approve room change.');
  }
  res.redirect('/admin/room-changes');
});

router.post('/room-changes/:id/reject', async (req, res) => {
  try {
    const { adminRemarks } = req.body;
    await RoomChangeRequest.findByIdAndUpdate(req.params.id, {
      status: 'rejected',
      adminRemarks: adminRemarks || 'Request rejected.'
    });
    req.flash('success', 'Room change request rejected.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to reject request.');
  }
  res.redirect('/admin/room-changes');
});

// ═══════════════════════════════════════════════════════════════════════════
// MESS MENU MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
router.get('/mess-menu', async (req, res) => {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const menu = await MessMenu.find().sort({
      day: 1
    });

    // Organize menu by day
    const menuByDay = {};
    days.forEach(day => {
      menuByDay[day] = menu.find(m => m.day === day) || { day, breakfast: '', lunch: '', snacks: '', dinner: '' };
    });

    res.render('admin/mess-menu', { title: 'Mess Menu Management', menuByDay, days });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load mess menu.');
    res.redirect('/admin/dashboard');
  }
});

router.post('/mess-menu', async (req, res) => {
  try {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    for (const day of days) {
      const breakfast = req.body[`${day}_breakfast`] || '';
      const lunch = req.body[`${day}_lunch`] || '';
      const snacks = req.body[`${day}_snacks`] || '';
      const dinner = req.body[`${day}_dinner`] || '';

      await MessMenu.findOneAndUpdate(
        { day },
        { breakfast, lunch, snacks, dinner, updatedBy: req.session.user._id, updatedAt: Date.now() },
        { upsert: true, new: true }
      );
    }

    req.flash('success', 'Mess menu updated successfully.');
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to update mess menu.');
  }
  res.redirect('/admin/mess-menu');
});

// ═══════════════════════════════════════════════════════════════════════════
// MEAL FEEDBACK (View)
// ═══════════════════════════════════════════════════════════════════════════
router.get('/feedback', async (req, res) => {
  try {
    const feedback = await MealFeedback.find()
      .populate('student', 'name email studentId')
      .sort('-createdAt')
      .limit(100);

    // Calculate average ratings per meal
    const avgRatings = await MealFeedback.aggregate([
      {
        $group: {
          _id: { day: '$day', mealType: '$mealType' },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.day': 1, '_id.mealType': 1 } }
    ]);

    res.render('admin/feedback', { title: 'Meal Feedback', feedback, avgRatings });
  } catch (err) {
    console.error(err);
    req.flash('error', 'Failed to load feedback.');
    res.redirect('/admin/dashboard');
  }
});

module.exports = router;
