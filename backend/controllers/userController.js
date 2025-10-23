const { body, validationResult } = require('express-validator');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants');
const { handleAsync, sendSuccessResponse, ValidationError } = require('../utils/errorHandler');
const userService = require('../services/userService');
const logger = require('../services/logger');

const createUser = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const userData = req.body;
  const user = await userService.createUser(userData);
  
  sendSuccessResponse(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.USER_CREATED, user);
});

const getAllUsers = handleAsync(async (req, res) => {
  const users = await userService.getAllUsers();
  sendSuccessResponse(res, HTTP_STATUS.OK, 'Users retrieved successfully', users);
});

module.exports = {
  createUser,
  getAllUsers
};
