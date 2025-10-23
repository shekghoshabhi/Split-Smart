const { body, validationResult } = require('express-validator');
const { HTTP_STATUS, SUCCESS_MESSAGES } = require('../constants');
const { handleAsync, sendSuccessResponse, ValidationError } = require('../utils/errorHandler');
const groupService = require('../services/groupService');
const logger = require('../services/logger');

const createGroup = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const groupData = req.body;
  const group = await groupService.createGroup(groupData);
  
  sendSuccessResponse(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.GROUP_CREATED, group);
});

const getAllGroups = handleAsync(async (req, res) => {
  const groups = await groupService.getAllGroups();
  sendSuccessResponse(res, HTTP_STATUS.OK, 'Groups retrieved successfully', groups);
});

const getGroupById = handleAsync(async (req, res) => {
  const { groupId } = req.params;
  const group = await groupService.getGroupById(groupId);
  sendSuccessResponse(res, HTTP_STATUS.OK, 'Group retrieved successfully', group);
});

const getGroupExpenses = handleAsync(async (req, res) => {
  const { groupId } = req.params;
  const expenses = await groupService.getGroupExpenses(groupId);
  sendSuccessResponse(res, HTTP_STATUS.OK, 'Expenses retrieved successfully', expenses);
});

const addExpense = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { groupId } = req.params;
  const expenseData = req.body;
  const result = await groupService.addExpense(groupId, expenseData);
  
  sendSuccessResponse(res, HTTP_STATUS.CREATED, SUCCESS_MESSAGES.EXPENSE_ADDED, result);
});

const updateExpense = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { groupId, expenseId } = req.params;
  const expenseData = req.body;
  const result = await groupService.updateExpense(groupId, expenseId, expenseData);
  
  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.EXPENSE_UPDATED, result);
});

const deleteExpense = handleAsync(async (req, res) => {
  const { groupId, expenseId } = req.params;
  const result = await groupService.deleteExpense(groupId, expenseId);
  
  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.EXPENSE_DELETED, result);
});

const getBalances = handleAsync(async (req, res) => {
  const { groupId } = req.params;
  const balances = await groupService.calculateBalances(groupId);
  sendSuccessResponse(res, HTTP_STATUS.OK, 'Balances retrieved successfully', { balances });
});

const settleBalance = handleAsync(async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    throw new ValidationError('Validation failed', errors.array());
  }

  const { groupId } = req.params;
  const settlementData = req.body;
  const result = await groupService.settleBalance(groupId, settlementData);
  
  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.BALANCE_SETTLED, result);
});

const getSettlementSuggestions = handleAsync(async (req, res) => {
  const { groupId } = req.params;
  const suggestions = await groupService.getSettlementSuggestions(groupId);
  sendSuccessResponse(res, HTTP_STATUS.OK, 'Settlement suggestions retrieved successfully', suggestions);
});

const generateSmartSummary = handleAsync(async (req, res) => {
  const { groupId } = req.params;
  const { query } = req.body;
  const result = await groupService.generateSmartSummary(groupId, query);
  
  sendSuccessResponse(res, HTTP_STATUS.OK, SUCCESS_MESSAGES.SUMMARY_GENERATED, result);
});

module.exports = {
  createGroup,
  getAllGroups,
  getGroupById,
  getGroupExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getBalances,
  settleBalance,
  getSettlementSuggestions,
  generateSmartSummary
};
