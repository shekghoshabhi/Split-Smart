const express = require('express');
const groupController = require('../controllers/groupController');
const { 
  validateCreateGroup, 
  validateAddExpense, 
  validateUpdateExpense, 
  validateSettleBalance 
} = require('../middleware/validation');

const router = express.Router();

router.post('/', validateCreateGroup, groupController.createGroup);
router.get('/', groupController.getAllGroups);
router.get('/:groupId', groupController.getGroupById);
router.get('/:groupId/expenses', groupController.getGroupExpenses);
router.post('/:groupId/expenses', validateAddExpense, groupController.addExpense);
router.put('/:groupId/expenses/:expenseId', validateUpdateExpense, groupController.updateExpense);
router.delete('/:groupId/expenses/:expenseId', groupController.deleteExpense);
router.get('/:groupId/balances', groupController.getBalances);
router.post('/:groupId/settle', validateSettleBalance, groupController.settleBalance);
router.get('/:groupId/settlement-suggestions', groupController.getSettlementSuggestions);
router.post('/:groupId/summaries', groupController.generateSmartSummary);

module.exports = router;
