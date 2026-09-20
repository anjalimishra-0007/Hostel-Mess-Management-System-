const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  roomNumber: {
    type: String,
    required: [true, 'Room number is required'],
    trim: true
  },
  block: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Block',
    required: [true, 'Block is required']
  },
  type: {
    type: String,
    enum: ['single', 'double', 'triple'],
    required: [true, 'Room type is required']
  },
  capacity: {
    type: Number,
    required: true
  },
  occupants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: String,
    enum: ['available', 'partially_occupied', 'full'],
    default: 'available'
  },
  floor: {
    type: Number,
    default: 1
  }
});

// Virtual: available beds
roomSchema.virtual('availableBeds').get(function () {
  return this.capacity - this.occupants.length;
});

// Auto-update status based on occupants
roomSchema.methods.updateStatus = function () {
  if (this.occupants.length === 0) {
    this.status = 'available';
  } else if (this.occupants.length < this.capacity) {
    this.status = 'partially_occupied';
  } else {
    this.status = 'full';
  }
};

// Pre-save hook to auto-sync status
roomSchema.pre('save', function (next) {
  this.updateStatus();
  next();
});

// Ensure virtuals are included in JSON output
roomSchema.set('toJSON', { virtuals: true });
roomSchema.set('toObject', { virtuals: true });

// Compound unique index
roomSchema.index({ roomNumber: 1, block: 1 }, { unique: true });

module.exports = mongoose.model('Room', roomSchema);
