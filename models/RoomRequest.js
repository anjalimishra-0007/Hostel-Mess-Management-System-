const mongoose = require('mongoose');

const roomRequestSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
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
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  allocatedRoom: {
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

module.exports = mongoose.model('RoomRequest', roomRequestSchema);
