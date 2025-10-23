const mongoose = require('mongoose');

const settlementSchema = new mongoose.Schema({
  txnId: {
    type: String,
    required: true,
    unique: true,
    default: () => `txn${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  },
  groupId: {
    type: String,
    ref: 'Group',
    required: true
  },
  from: {
    type: String,
    ref: 'User',
    required: true
  },
  to: {
    type: String,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['settled', 'pending', 'cancelled'],
    default: 'settled'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Settlement', settlementSchema);
