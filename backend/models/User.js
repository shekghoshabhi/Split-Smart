const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
    default: () => `u${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
