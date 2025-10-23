const { body } = require('express-validator');
const { VALIDATION_MESSAGES, SPLIT_TYPES } = require('../constants');

const validateCreateUser = [
  body('name').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('email').isEmail().withMessage(VALIDATION_MESSAGES.INVALID_EMAIL)
];

const validateCreateGroup = [
  body('name').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('members').isArray({ min: 1 }).withMessage(VALIDATION_MESSAGES.MIN_MEMBERS)
];

const validateAddExpense = [
  body('paidBy').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('amount').isFloat({ min: 0.01 }).withMessage(VALIDATION_MESSAGES.INVALID_AMOUNT),
  body('description').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('splitBetween').isArray({ min: 1 }).withMessage(VALIDATION_MESSAGES.MIN_MEMBERS),
  body('splitType').isIn(Object.values(SPLIT_TYPES)).withMessage(VALIDATION_MESSAGES.INVALID_SPLIT_TYPE)
];

const validateUpdateExpense = [
  body('paidBy').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('amount').isFloat({ min: 0.01 }).withMessage(VALIDATION_MESSAGES.INVALID_AMOUNT),
  body('description').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('splitBetween').isArray({ min: 1 }).withMessage(VALIDATION_MESSAGES.MIN_MEMBERS),
  body('splitType').isIn(Object.values(SPLIT_TYPES)).withMessage(VALIDATION_MESSAGES.INVALID_SPLIT_TYPE)
];

const validateSettleBalance = [
  body('from').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('to').notEmpty().withMessage(VALIDATION_MESSAGES.REQUIRED),
  body('amount').isNumeric().withMessage(VALIDATION_MESSAGES.INVALID_AMOUNT)
];

module.exports = {
  validateCreateUser,
  validateCreateGroup,
  validateAddExpense,
  validateUpdateExpense,
  validateSettleBalance
};
