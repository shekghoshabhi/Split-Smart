const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');

const router = express.Router();

// Create User
router.post('/', [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email is required')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    // Create new user
    const user = new User({ name, email });
    await user.save();

    res.status(201).json({
      userId: user.userId,
      name: user.name,
      email: user.email
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await User.find({}, 'userId name email');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
