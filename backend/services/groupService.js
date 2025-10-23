const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errorHandler');
const { SPLIT_TYPES, CURRENCY } = require('../constants');
const logger = require('./logger');
const userService = require('./userService');
const AIExpenseCategorizer = require('./aiService');

class GroupService {
  constructor() {
    this.aiCategorizer = new AIExpenseCategorizer();
  }

  async createGroup(groupData) {
    try {
      logger.logDatabaseOperation('create', 'groups', groupData);
      
      await userService.validateUsersExist(groupData.members);
      
      const group = new Group(groupData);
      await group.save();
      
      logger.info('Group created successfully', { groupId: group.groupId, name: group.name });
      
      return {
        groupId: group.groupId,
        name: group.name,
        members: group.members,
        createdAt: group.createdAt
      };
    } catch (error) {
      logger.logError(error, { operation: 'createGroup', groupData });
      throw error;
    }
  }

  async getAllGroups() {
    try {
      logger.logDatabaseOperation('find', 'groups', {});
      
      const groups = await Group.find({});
      const groupsWithMembers = await Promise.all(
        groups.map(async (group) => {
          const members = await userService.getUserNames(group.members);
          return {
            groupId: group.groupId,
            name: group.name,
            members: members,
            createdAt: group.createdAt
          };
        })
      );
      
      logger.info('Groups retrieved successfully', { count: groupsWithMembers.length });
      
      return groupsWithMembers;
    } catch (error) {
      logger.logError(error, { operation: 'getAllGroups' });
      throw error;
    }
  }

  async getGroupById(groupId) {
    try {
      logger.logDatabaseOperation('findOne', 'groups', { groupId });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }
      
      const members = await userService.getUserNames(group.members);
      const expenses = await this.getGroupExpenses(groupId);
      
      return {
        groupId: group.groupId,
        name: group.name,
        members: members,
        expenses: expenses,
        createdAt: group.createdAt
      };
    } catch (error) {
      logger.logError(error, { operation: 'getGroupById', groupId });
      throw error;
    }
  }

  async getGroupExpenses(groupId) {
    try {
      logger.logDatabaseOperation('find', 'expenses', { groupId });
      
      const expenses = await Expense.find({ groupId });
      
      const expensesWithUsers = await Promise.all(
        expenses.map(async (expense) => {
          const user = await userService.getUserById(expense.paidBy);
          return {
            ...expense.toObject(),
            paidByUser: user ? { userId: user.userId, name: user.name, email: user.email } : null
          };
        })
      );
      
      return expensesWithUsers;
    } catch (error) {
      logger.logError(error, { operation: 'getGroupExpenses', groupId });
      throw error;
    }
  }

  async addExpense(groupId, expenseData) {
    try {
      logger.logDatabaseOperation('create', 'expenses', { groupId, ...expenseData });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const paidByUser = await userService.getUserById(expenseData.paidBy);
      if (!paidByUser) {
        throw new NotFoundError('User');
      }
      
      if (!group.members.includes(expenseData.paidBy)) {
        throw new ValidationError('Paid by user is not a member of this group');
      }

      await userService.validateUsersExist(expenseData.splitBetween);
      
      const invalidSplitUsers = expenseData.splitBetween.filter(userId => !group.members.includes(userId));
      if (invalidSplitUsers.length > 0) {
        throw new ValidationError('One or more split users are not members of this group');
      }

      if (expenseData.splitType === SPLIT_TYPES.PERCENTAGE) {
        const totalPercentage = expenseData.splitDetails.reduce((sum, detail) => sum + detail.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new ValidationError('Percentages must sum to 100');
        }
      } else if (expenseData.splitType === SPLIT_TYPES.EXACT_AMOUNTS) {
        const totalAmount = expenseData.splitDetails.reduce((sum, detail) => sum + detail.amount, 0);
        if (Math.abs(totalAmount - expenseData.amount) > 0.01) {
          throw new ValidationError('Exact amounts must sum to total expense amount');
        }
      }

      const category = await this.aiCategorizer.categorizeExpense(expenseData.description);

      const expense = new Expense({
        groupId,
        paidBy: expenseData.paidBy,
        amount: parseFloat(expenseData.amount.toFixed(4)),
        description: expenseData.description,
        splitBetween: expenseData.splitBetween,
        splitType: expenseData.splitType,
        splitDetails: expenseData.splitDetails || [],
        category
      });

      await expense.save();
      
      logger.info('Expense added successfully', { expenseId: expense.expenseId, groupId });
      
      return {
        expenseId: expense.expenseId,
        status: 'success'
      };
    } catch (error) {
      logger.logError(error, { operation: 'addExpense', groupId, expenseData });
      throw error;
    }
  }

  async updateExpense(groupId, expenseId, expenseData) {
    try {
      logger.logDatabaseOperation('update', 'expenses', { groupId, expenseId, ...expenseData });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const existingExpense = await Expense.findOne({ expenseId, groupId });
      if (!existingExpense) {
        throw new NotFoundError('Expense');
      }

      const paidByUser = await userService.getUserById(expenseData.paidBy);
      if (!paidByUser) {
        throw new NotFoundError('User');
      }
      
      if (!group.members.includes(expenseData.paidBy)) {
        throw new ValidationError('Paid by user is not a member of this group');
      }

      await userService.validateUsersExist(expenseData.splitBetween);
      
      const invalidSplitUsers = expenseData.splitBetween.filter(userId => !group.members.includes(userId));
      if (invalidSplitUsers.length > 0) {
        throw new ValidationError('One or more split users are not members of this group');
      }

      if (expenseData.splitType === SPLIT_TYPES.PERCENTAGE) {
        const totalPercentage = expenseData.splitDetails.reduce((sum, detail) => sum + detail.percentage, 0);
        if (Math.abs(totalPercentage - 100) > 0.01) {
          throw new ValidationError('Percentages must sum to 100');
        }
      } else if (expenseData.splitType === SPLIT_TYPES.EXACT_AMOUNTS) {
        const totalAmount = expenseData.splitDetails.reduce((sum, detail) => sum + detail.amount, 0);
        if (Math.abs(totalAmount - expenseData.amount) > 0.01) {
          throw new ValidationError('Exact amounts must sum to total expense amount');
        }
      }

      const category = await this.aiCategorizer.categorizeExpense(expenseData.description);

      const updatedExpense = await Expense.findOneAndUpdate(
        { expenseId, groupId },
        {
          paidBy: expenseData.paidBy,
          amount: parseFloat(expenseData.amount.toFixed(4)),
          description: expenseData.description,
          splitBetween: expenseData.splitBetween,
          splitType: expenseData.splitType,
          splitDetails: expenseData.splitDetails || [],
          category,
          updatedAt: new Date()
        },
        { new: true }
      );

      logger.info('Expense updated successfully', { expenseId: updatedExpense.expenseId, groupId });
      
      return {
        expenseId: updatedExpense.expenseId,
        status: 'success',
        message: 'Expense updated successfully'
      };
    } catch (error) {
      logger.logError(error, { operation: 'updateExpense', groupId, expenseId, expenseData });
      throw error;
    }
  }

  async deleteExpense(groupId, expenseId) {
    try {
      logger.logDatabaseOperation('delete', 'expenses', { groupId, expenseId });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const existingExpense = await Expense.findOne({ expenseId, groupId });
      if (!existingExpense) {
        throw new NotFoundError('Expense');
      }

      await Expense.findOneAndDelete({ expenseId, groupId });

      logger.info('Expense deleted successfully', { expenseId, groupId });
      
      return {
        status: 'success',
        message: 'Expense deleted successfully'
      };
    } catch (error) {
      logger.logError(error, { operation: 'deleteExpense', groupId, expenseId });
      throw error;
    }
  }

  async calculateBalances(groupId) {
    try {
      logger.logDatabaseOperation('calculate', 'balances', { groupId });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const expenses = await Expense.find({ groupId });

      const balances = {};
      group.members.forEach(member => {
        balances[member] = {};
        group.members.forEach(otherMember => {
          if (member !== otherMember) {
            balances[member][otherMember] = 0;
          }
        });
      });

      expenses.forEach(expense => {
        const paidBy = expense.paidBy;
        const splitBetween = expense.splitBetween;
        const amount = expense.amount;

        if (expense.splitType === SPLIT_TYPES.EQUAL) {
          const amountPerPerson = amount / splitBetween.length;
          splitBetween.forEach(person => {
            if (person !== paidBy) {
              balances[person][paidBy] += amountPerPerson;
            }
          });
        } else if (expense.splitType === SPLIT_TYPES.PERCENTAGE) {
          expense.splitDetails.forEach(detail => {
            const personAmount = (amount * detail.percentage) / 100;
            if (detail.userId !== paidBy) {
              balances[detail.userId][paidBy] += personAmount;
            }
          });
        } else if (expense.splitType === SPLIT_TYPES.EXACT_AMOUNTS) {
          expense.splitDetails.forEach(detail => {
            if (detail.userId !== paidBy) {
              balances[detail.userId][paidBy] += detail.amount;
            }
          });
        }
      });

      const balanceArray = [];
      Object.keys(balances).forEach(from => {
        Object.keys(balances[from]).forEach(to => {
          if (balances[from][to] > 0) {
            balanceArray.push({
              from,
              to,
              amount: parseFloat(balances[from][to].toFixed(4))
            });
          }
        });
      });

      return balanceArray;
    } catch (error) {
      logger.logError(error, { operation: 'calculateBalances', groupId });
      throw error;
    }
  }

  async settleBalance(groupId, settlementData) {
    try {
      logger.logDatabaseOperation('create', 'settlements', { groupId, ...settlementData });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const balances = await this.calculateBalances(groupId);
      const balanceExists = balances.some(balance => 
        balance.from === settlementData.from && 
        balance.to === settlementData.to && 
        Math.abs(balance.amount - settlementData.amount) < 0.01
      );

      if (!balanceExists) {
        throw new ValidationError('Invalid settlement amount');
      }

      const settlement = new Settlement({
        groupId,
        from: settlementData.from,
        to: settlementData.to,
        amount: parseFloat(settlementData.amount.toFixed(4)),
        settledAt: new Date()
      });

      await settlement.save();
      
      logger.info('Balance settled successfully', { settlementId: settlement.settlementId, groupId });
      
      return {
        status: 'settled',
        txnId: settlement.settlementId
      };
    } catch (error) {
      logger.logError(error, { operation: 'settleBalance', groupId, settlementData });
      throw error;
    }
  }

  async getSettlementSuggestions(groupId) {
    try {
      logger.logDatabaseOperation('suggest', 'settlements', { groupId });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const balances = await this.calculateBalances(groupId);

      if (balances.length === 0) {
        return { suggestions: [], message: 'All balances are already settled!' };
      }

      const suggestions = await this.aiCategorizer.suggestOptimalSettlement(balances);

      return { 
        suggestions,
        originalTransactions: balances.length,
        optimizedTransactions: suggestions.length,
        savings: balances.length - suggestions.length
      };
    } catch (error) {
      logger.logError(error, { operation: 'getSettlementSuggestions', groupId });
      throw error;
    }
  }

  async generateSmartSummary(groupId, query) {
    try {
      logger.logDatabaseOperation('generate', 'summary', { groupId, query });
      
      const group = await Group.findOne({ groupId });
      if (!group) {
        throw new NotFoundError('Group');
      }

      const expenses = await Expense.find({ groupId });
      const members = await userService.getUserNames(group.members);
      const balances = await this.calculateBalances(groupId);

      const aggregatedData = {
        groupName: group.name,
        totalExpenses: expenses.length,
        totalAmount: expenses.reduce((sum, expense) => sum + expense.amount, 0),
        expenses: expenses.map(expense => ({
          description: expense.description,
          amount: expense.amount,
          paidBy: members.find(m => m.userId === expense.paidBy)?.name || expense.paidBy,
          splitBetween: expense.splitBetween.map(userId => 
            members.find(m => m.userId === userId)?.name || userId
          ),
          category: expense.category,
          date: expense.createdAt
        })),
        members: members.map(member => ({
          name: member.name,
          email: member.email
        })),
        balances: balances.map(balance => ({
          from: members.find(m => m.userId === balance.from)?.name || balance.from,
          to: members.find(m => m.userId === balance.to)?.name || balance.to,
          amount: balance.amount
        })),
        spendingByPerson: {},
        spendingByCategory: {}
      };

      expenses.forEach(expense => {
        const paidByName = members.find(m => m.userId === expense.paidBy)?.name || expense.paidBy;
        aggregatedData.spendingByPerson[paidByName] = (aggregatedData.spendingByPerson[paidByName] || 0) + expense.amount;
      });

      expenses.forEach(expense => {
        aggregatedData.spendingByCategory[expense.category] = (aggregatedData.spendingByCategory[expense.category] || 0) + expense.amount;
      });

      const summary = await this.aiCategorizer.generateSmartSummary(query, aggregatedData);

      logger.info('Smart summary generated successfully', { groupId, query });

      return {
        summary,
        data: aggregatedData,
        query: query || 'General summary'
      };
    } catch (error) {
      logger.logError(error, { operation: 'generateSmartSummary', groupId, query });
      throw error;
    }
  }
}

module.exports = new GroupService();
