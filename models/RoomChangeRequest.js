const mongoose = require('mongoose');

const roomChangeRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  currentRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room',
    required: true
  },
  preferredBlock: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block'
  },
  preferredRoomType: {
    type: String,
    enum: ['single', 'double', 'triple']
  },
  reason: {
    type: String,
    required: [true, 'Reason is required'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  newRoom: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Room'
  },
  adminRemarks: {
    type: String,
    trim: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('RoomChangeRequest', roomChangeRequestSchema);
