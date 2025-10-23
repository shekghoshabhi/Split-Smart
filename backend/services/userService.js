const User = require('../models/User');
const { ValidationError, ConflictError, NotFoundError } = require('../utils/errorHandler');
const { VALIDATION_MESSAGES, ERROR_MESSAGES, SUCCESS_MESSAGES } = require('../constants');
const logger = require('./logger');

class UserService {
  async createUser(userData) {
    try {
      logger.logDatabaseOperation('create', 'users', userData);
      
      const existingUser = await User.findOne({ email: userData.email });
      if (existingUser) {
        throw new ConflictError('User with this email already exists');
      }

      const user = new User(userData);
      await user.save();
      
      logger.info('User created successfully', { userId: user.userId, email: user.email });
      
      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };
    } catch (error) {
      logger.logError(error, { operation: 'createUser', userData });
      throw error;
    }
  }

  async getAllUsers() {
    try {
      logger.logDatabaseOperation('find', 'users', {});
      
      const users = await User.find({}).select('userId name email createdAt');
      
      logger.info('Users retrieved successfully', { count: users.length });
      
      return users;
    } catch (error) {
      logger.logError(error, { operation: 'getAllUsers' });
      throw error;
    }
  }

  async getUserById(userId) {
    try {
      logger.logDatabaseOperation('findOne', 'users', { userId });
      
      const user = await User.findOne({ userId });
      if (!user) {
        throw new NotFoundError('User');
      }
      
      return {
        userId: user.userId,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt
      };
    } catch (error) {
      logger.logError(error, { operation: 'getUserById', userId });
      throw error;
    }
  }

  async validateUsersExist(userIds) {
    try {
      logger.logDatabaseOperation('find', 'users', { userId: { $in: userIds } });
      
      const users = await User.find({ userId: { $in: userIds } });
      
      if (users.length !== userIds.length) {
        const foundUserIds = users.map(user => user.userId);
        const missingUserIds = userIds.filter(id => !foundUserIds.includes(id));
        throw new ValidationError(`Users not found: ${missingUserIds.join(', ')}`);
      }
      
      return users;
    } catch (error) {
      logger.logError(error, { operation: 'validateUsersExist', userIds });
      throw error;
    }
  }

  async getUserNames(userIds) {
    try {
      logger.logDatabaseOperation('find', 'users', { userId: { $in: userIds } });
      
      const users = await User.find({ userId: { $in: userIds } })
        .select('userId name email');
      
      return users;
    } catch (error) {
      logger.logError(error, { operation: 'getUserNames', userIds });
      throw error;
    }
  }
}

module.exports = new UserService();
