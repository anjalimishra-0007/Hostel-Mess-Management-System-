const mongoose = require('mongoose');

const messBillSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  },
  year: {
    type: Number,
    required: true
  },
  daysPresent: {
    type: Number,
    required: true,
    min: 0,
    max: 31
  },
  ratePerDay: {
    type: Number,
    required: true,
    default: 120
  },
  totalAmount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['unpaid', 'paid'],
    default: 'unpaid'
  }
}, {
  timestamps: true
});

// One bill per student per month
messBillSchema.index({ student: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('MessBill', messBillSchema);
