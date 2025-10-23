const mongoose = require('mongoose');

const expenseSchema = new mongoose.Schema({
  expenseId: {
    type: String,
    required: true,
    unique: true,
    default: () => `e${Date.now()}${Math.random().toString(36).substr(2, 5)}`
  },
  groupId: {
    type: String,
    ref: 'Group',
    required: true
  },
  paidBy: {
    type: String,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  splitBetween: [{
    type: String,
    ref: 'User',
    required: true
  }],
  splitType: {
    type: String,
    enum: ['equal', 'percentage', 'exact_amounts'],
    required: true
  },
  splitDetails: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  category: {
    type: String,
    default: 'uncategorized'
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Expense', expenseSchema);
