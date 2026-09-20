const mongoose = require('mongoose');

const blockSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Block name is required'],
    unique: true,
    trim: true
  },
  type: {
    type: String,
    enum: ['boys', 'girls'],
    required: [true, 'Block type is required']
  },
  totalRooms: {
    type: Number,
    default: 0
  },
  description: {
    type: String,
    trim: true
  }
});

module.exports = mongoose.model('Block', blockSchema);
