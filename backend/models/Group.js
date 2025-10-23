const mongoose = require('mongoose');

const groupSchema = new mongoose.Schema({
  groupId: {
    type: String,
    required: true,
    unique: true,
    default: () => `g${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  members: [{
    type: String,
    ref: 'User',
    required: true
  }],
  createdBy: {
    type: String,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Group', groupSchema);
