const express = require('express');
const userController = require('../controllers/userController');
const { validateCreateUser } = require('../middleware/validation');

const router = express.Router();

router.post('/', validateCreateUser, userController.createUser);
router.get('/', userController.getAllUsers);

module.exports = router;
