const express = require('express');
const { body, validationResult } = require('express-validator');
const axios = require('axios');
const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');
const User = require('../models/User');
const AIExpenseCategorizer = require('../services/aiService');

const router = express.Router();
const aiCategorizer = new AIExpenseCategorizer();

// Get All Groups
router.get('/', async (req, res) => {
  try {
    const groups = await Group.find({});
    // Get member details for each group
    const groupsWithMembers = await Promise.all(
      groups.map(async (group) => {
        const members = await User.find({ userId: { $in: group.members } });
        return {
          groupId: group.groupId,
          name: group.name,
          members: members,
          createdAt: group.createdAt
        };
      })
    );
    res.json(groupsWithMembers);
  } catch (error) {
    console.error('Error fetching groups:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Group
router.post('/', [
  body('name').notEmpty().withMessage('Group name is required'),
  body('members').isArray({ min: 1 }).withMessage('At least one member is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, members } = req.body;

    // Verify all members exist
    const existingUsers = await User.find({ userId: { $in: members } });
    if (existingUsers.length !== members.length) {
      return res.status(400).json({ error: 'One or more users do not exist' });
    }

    // Create new group
    const group = new Group({ 
      name, 
      members,
      createdBy: members[0] // First member is the creator
    });
    await group.save();

    res.status(201).json({
      groupId: group.groupId,
      name: group.name
    });
  } catch (error) {
    console.error('Error creating group:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Group Expenses
router.get('/:groupId/expenses', async (req, res) => {
  try {
    const { groupId } = req.params;
    const expenses = await Expense.find({ groupId });
    
    // Get user details for each expense
    const expensesWithUsers = await Promise.all(
      expenses.map(async (expense) => {
        const user = await User.findOne({ userId: expense.paidBy });
        return {
          ...expense.toObject(),
          paidByUser: user ? { userId: user.userId, name: user.name, email: user.email } : null
        };
      })
    );
    
    res.json(expensesWithUsers);
  } catch (error) {
    console.error('Error fetching group expenses:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add Expense to Group
router.post('/:groupId/expenses', [
  body('paidBy').notEmpty().withMessage('Paid by is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('description').notEmpty().withMessage('Description is required'),
  body('splitBetween').isArray({ min: 1 }).withMessage('At least one person must be included in split'),
  body('splitType').isIn(['equal', 'percentage', 'exact_amounts']).withMessage('Invalid split type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { paidBy, amount, description, splitBetween, splitType, splitDetails } = req.body;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify paidBy is in group members
    if (!group.members.includes(paidBy)) {
      return res.status(400).json({ error: 'Payer must be a group member' });
    }

    // Verify all splitBetween users are group members
    const invalidMembers = splitBetween.filter(member => !group.members.includes(member));
    if (invalidMembers.length > 0) {
      return res.status(400).json({ error: 'All split members must be group members' });
    }

    // AI-powered expense categorization
    const category = await aiCategorizer.categorizeExpense(description);

    // Create expense
    const expense = new Expense({
      groupId,
      paidBy,
      amount: parseFloat(amount),
      description,
      splitBetween,
      splitType,
      splitDetails: splitDetails || {},
      category
    });

    await expense.save();

    res.status(201).json({
      expenseId: expense.expenseId,
      status: 'success'
    });
  } catch (error) {
    console.error('Error adding expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Edit Expense
router.put('/:groupId/expenses/:expenseId', [
  body('paidBy').notEmpty().withMessage('Paid by is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('description').notEmpty().withMessage('Description is required'),
  body('splitBetween').isArray({ min: 1 }).withMessage('At least one person must be included in split'),
  body('splitType').isIn(['equal', 'percentage', 'exact_amounts']).withMessage('Invalid split type')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId, expenseId } = req.params;
    const { paidBy, amount, description, splitBetween, splitType, splitDetails } = req.body;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify expense exists
    const existingExpense = await Expense.findOne({ expenseId, groupId });
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Verify paidBy user exists and is in group
    const paidByUser = await User.findOne({ userId: paidBy });
    if (!paidByUser) {
      return res.status(400).json({ error: 'Paid by user not found' });
    }
    if (!group.members.includes(paidBy)) {
      return res.status(400).json({ error: 'Paid by user is not a member of this group' });
    }

    // Verify all split users exist and are in group
    const splitUsers = await User.find({ userId: { $in: splitBetween } });
    if (splitUsers.length !== splitBetween.length) {
      return res.status(400).json({ error: 'One or more split users not found' });
    }
    const invalidSplitUsers = splitBetween.filter(userId => !group.members.includes(userId));
    if (invalidSplitUsers.length > 0) {
      return res.status(400).json({ error: 'One or more split users are not members of this group' });
    }

    // Validate split details based on split type
    if (splitType === 'percentage') {
      const totalPercentage = splitDetails.reduce((sum, detail) => sum + detail.percentage, 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        return res.status(400).json({ error: 'Percentages must sum to 100' });
      }
    } else if (splitType === 'exact_amounts') {
      const totalAmount = splitDetails.reduce((sum, detail) => sum + detail.amount, 0);
      if (Math.abs(totalAmount - amount) > 0.01) {
        return res.status(400).json({ error: 'Exact amounts must sum to total expense amount' });
      }
    }

    // Use AI to categorize the expense
    const category = await aiCategorizer.categorizeExpense(description);

    // Update the expense
    const updatedExpense = await Expense.findOneAndUpdate(
      { expenseId, groupId },
      {
        paidBy,
        amount: parseFloat(amount.toFixed(4)),
        description,
        splitBetween,
        splitType,
        splitDetails: splitDetails || [],
        category,
        updatedAt: new Date()
      },
      { new: true }
    );

    res.json({
      expenseId: updatedExpense.expenseId,
      status: 'success',
      message: 'Expense updated successfully'
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Expense
router.delete('/:groupId/expenses/:expenseId', async (req, res) => {
  try {
    const { groupId, expenseId } = req.params;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify expense exists
    const existingExpense = await Expense.findOne({ expenseId, groupId });
    if (!existingExpense) {
      return res.status(404).json({ error: 'Expense not found' });
    }

    // Delete the expense
    await Expense.findOneAndDelete({ expenseId, groupId });

    res.json({
      status: 'success',
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Balances in Group
router.get('/:groupId/balances', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ groupId });

    // Calculate balances
    const balances = {};
    
    // Initialize balances for all group members
    group.members.forEach(member => {
      balances[member] = {};
      group.members.forEach(otherMember => {
        if (member !== otherMember) {
          balances[member][otherMember] = 0;
        }
      });
    });

    // Process each expense
    expenses.forEach(expense => {
      const { paidBy, amount, splitBetween, splitType, splitDetails } = expense;
      
      let splitAmounts = {};
      
      if (splitType === 'equal') {
        const perPerson = amount / splitBetween.length;
        splitBetween.forEach(member => {
          splitAmounts[member] = perPerson;
        });
      } else if (splitType === 'percentage') {
        splitBetween.forEach(member => {
          const percentage = splitDetails[member] || 0;
          splitAmounts[member] = (amount * percentage) / 100;
        });
      } else if (splitType === 'exact_amounts') {
        splitAmounts = splitDetails;
      }

      // Update balances
      splitBetween.forEach(member => {
        if (member !== paidBy) {
          const amountOwed = splitAmounts[member] || 0;
          balances[member][paidBy] += amountOwed;
          balances[paidBy][member] -= amountOwed;
        }
      });
    });

    // Get settlements to adjust balances
    const settlements = await Settlement.find({ groupId, status: 'settled' });
    settlements.forEach(settlement => {
      const { from, to, amount } = settlement;
      balances[from][to] -= amount;
      balances[to][from] += amount;
    });

    // Convert to the required format
    const balanceArray = [];
    group.members.forEach(from => {
      group.members.forEach(to => {
        if (from !== to && balances[from][to] > 0) {
          balanceArray.push({
            from,
            to,
            amount: parseFloat(balances[from][to].toFixed(4))
          });
        }
      });
    });

    res.json({ balances: balanceArray });
  } catch (error) {
    console.error('Error getting balances:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Settle Balance
router.post('/:groupId/settle', [
  body('from').notEmpty().withMessage('From user is required'),
  body('to').notEmpty().withMessage('To user is required'),
  body('amount').isNumeric().withMessage('Amount must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { groupId } = req.params;
    const { from, to, amount } = req.body;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Verify both users are group members
    if (!group.members.includes(from) || !group.members.includes(to)) {
      return res.status(400).json({ error: 'Both users must be group members' });
    }

    // Create settlement
    const settlement = new Settlement({
      groupId,
      from,
      to,
      amount: parseFloat(amount)
    });

    await settlement.save();

    res.status(201).json({
      status: 'settled',
      txnId: settlement.txnId
    });
  } catch (error) {
    console.error('Error settling balance:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get Group Details
router.get('/:groupId', async (req, res) => {
  try {
    const { groupId } = req.params;

    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get group members details
    const members = await User.find({ userId: { $in: group.members } });
    
    // Get expenses
    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });

    res.json({
      groupId: group.groupId,
      name: group.name,
      members: members.map(member => ({
        userId: member.userId,
        name: member.name,
        email: member.email
      })),
      expenses
    });
  } catch (error) {
    console.error('Error getting group details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get AI-powered settlement suggestions
router.get('/:groupId/settlement-suggestions', async (req, res) => {
  try {
    const { groupId } = req.params;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get current balances
    const balancesResponse = await axios.get(`/api/groups/${groupId}/balances`);
    const balances = balancesResponse.data.balances;

    if (balances.length === 0) {
      return res.json({ suggestions: [], message: 'All balances are already settled!' });
    }

    // Get AI-powered settlement suggestions
    const suggestions = await aiCategorizer.suggestOptimalSettlement(balances);

    res.json({ 
      suggestions,
      originalTransactions: balances.length,
      optimizedTransactions: suggestions.length,
      savings: balances.length - suggestions.length
    });
  } catch (error) {
    console.error('Error getting settlement suggestions:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to calculate balances
async function calculateBalances(groupId) {
  try {
    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      throw new Error('Group not found');
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ groupId });

    // Initialize balances object
    const balances = {};
    group.members.forEach(member => {
      balances[member] = {};
      group.members.forEach(otherMember => {
        if (member !== otherMember) {
          balances[member][otherMember] = 0;
        }
      });
    });

    // Calculate balances from expenses
    expenses.forEach(expense => {
      const paidBy = expense.paidBy;
      const splitBetween = expense.splitBetween;
      const amount = expense.amount;

      if (expense.splitType === 'equal') {
        const amountPerPerson = amount / splitBetween.length;
        splitBetween.forEach(person => {
          if (person !== paidBy) {
            balances[person][paidBy] += amountPerPerson;
          }
        });
      } else if (expense.splitType === 'percentage') {
        expense.splitDetails.forEach(detail => {
          const personAmount = (amount * detail.percentage) / 100;
          if (detail.userId !== paidBy) {
            balances[detail.userId][paidBy] += personAmount;
          }
        });
      } else if (expense.splitType === 'exact_amounts') {
        expense.splitDetails.forEach(detail => {
          if (detail.userId !== paidBy) {
            balances[detail.userId][paidBy] += detail.amount;
          }
        });
      }
    });

    // Convert to array format
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
    console.error('Error calculating balances:', error);
    return [];
  }
}

// Smart Summaries
router.post('/:groupId/summaries', async (req, res) => {
  try {
    const { groupId } = req.params;
    const { query } = req.body;

    // Verify group exists
    const group = await Group.findOne({ groupId });
    if (!group) {
      return res.status(404).json({ error: 'Group not found' });
    }

    // Get all expenses for this group
    const expenses = await Expense.find({ groupId });
    
    // Get member details
    const members = await User.find({ userId: { $in: group.members } });
    
    // Get current balances
    const balances = await calculateBalances(groupId);

    // Aggregate data for AI analysis
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

    // Calculate spending by person
    expenses.forEach(expense => {
      const paidByName = members.find(m => m.userId === expense.paidBy)?.name || expense.paidBy;
      aggregatedData.spendingByPerson[paidByName] = (aggregatedData.spendingByPerson[paidByName] || 0) + expense.amount;
    });

    // Calculate spending by category
    expenses.forEach(expense => {
      aggregatedData.spendingByCategory[expense.category] = (aggregatedData.spendingByCategory[expense.category] || 0) + expense.amount;
    });

    // Generate AI-powered summary
    const summary = await generateSmartSummary(query, aggregatedData);

    res.json({
      summary,
      data: aggregatedData,
      query: query || 'General summary'
    });

  } catch (error) {
    console.error('Error generating smart summary:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Helper function to generate smart summary using AI
async function generateSmartSummary(query, data) {
  const apiKey = process.env.OPENAI_API_KEY;
  
  console.log('API Key available:', !!apiKey);
  console.log('Query:', query);
  
  if (!apiKey) {
    console.log('No API key, using fallback');
    return generateFallbackSummary(query, data);
  }

  try {
    const prompt = `
You are a helpful expense analysis assistant. Analyze the following trip expense data and provide a conversational summary based on the user's query.

User Query: "${query || 'Provide a general summary of this trip'}"
Group Name: ${data.groupName}
Total Expenses: ${data.totalExpenses}
Total Amount: $${data.totalAmount.toFixed(2)}

Expenses:
${data.expenses.map(expense => 
  `- ${expense.description}: $${expense.amount.toFixed(2)} (paid by ${expense.paidBy}, split between ${expense.splitBetween.join(', ')}, category: ${expense.category})`
).join('\n')}

Spending by Person:
${Object.entries(data.spendingByPerson).map(([person, amount]) => 
  `- ${person}: $${amount.toFixed(2)}`
).join('\n')}

Spending by Category:
${Object.entries(data.spendingByCategory).map(([category, amount]) => 
  `- ${category}: $${amount.toFixed(2)}`
).join('\n')}

Current Balances:
${data.balances.map(balance => 
  `- ${balance.from} owes ${balance.to}: $${balance.amount.toFixed(2)}`
).join('\n')}

Please provide a conversational, friendly summary that answers the user's query. Include insights about:
1. Total spending and expense breakdown
2. Who spent the most/least
3. Most expensive categories
4. Current balance situation
5. Any interesting patterns or insights

Keep the response conversational and helpful, as if you're talking to a friend about their trip expenses.
`;

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful expense analysis assistant that provides conversational summaries of trip expenses.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 500,
        temperature: 0.7
      },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        }
    );

    return response.data.choices[0].message.content.trim();
  } catch (error) {
    console.error('AI summary generation error:', error.message);
    console.error('Full error:', error);
    return generateFallbackSummary(query, data);
  }
}

// Fallback summary when AI is not available
function generateFallbackSummary(query, data) {
  const topSpender = Object.entries(data.spendingByPerson)
    .sort(([,a], [,b]) => b - a)[0];
  const topCategory = Object.entries(data.spendingByCategory)
    .sort(([,a], [,b]) => b - a)[0];
  
  const queryLower = query.toLowerCase();
  let summary = '';
  
  // Query-specific responses
  if (queryLower.includes('who spent') || queryLower.includes('biggest spender') || queryLower.includes('most overall')) {
    summary = `💰 Spending Analysis for ${data.groupName}:\n\n`;
    if (topSpender) {
      summary += `💸 Top spender: ${topSpender[0]} with $${topSpender[1].toFixed(2)}\n\n`;
    }
    summary += `📊 All spending breakdown:\n`;
    Object.entries(data.spendingByPerson)
      .sort(([,a], [,b]) => b - a)
      .forEach(([person, amount]) => {
        summary += `• ${person}: $${amount.toFixed(2)}\n`;
      });
  } else if (queryLower.includes('category') || queryLower.includes('categories')) {
    summary = `📊 Expense Categories for ${data.groupName}:\n\n`;
    if (topCategory) {
      summary += `🏆 Top category: ${topCategory[0]} with $${topCategory[1].toFixed(2)}\n\n`;
    }
    summary += `📈 All categories:\n`;
    Object.entries(data.spendingByCategory)
      .sort(([,a], [,b]) => b - a)
      .forEach(([category, amount]) => {
        summary += `• ${category}: $${amount.toFixed(2)}\n`;
      });
  } else if (queryLower.includes('balance') || queryLower.includes('owe') || queryLower.includes('debt')) {
    summary = `👥 Current Balances for ${data.groupName}:\n\n`;
    if (data.balances.length === 0) {
      summary += `🎉 All settled up! No outstanding balances.\n`;
    } else {
      summary += `📋 Outstanding debts:\n`;
      data.balances.forEach(balance => {
        summary += `• ${balance.from} owes ${balance.to}: $${balance.amount.toFixed(2)}\n`;
      });
    }
  } else if (queryLower.includes('food') || queryLower.includes('dining') || queryLower.includes('restaurant')) {
    const foodSpending = data.spendingByCategory.food || 0;
    summary = `🍽️ Food & Dining for ${data.groupName}:\n\n`;
    summary += `💰 Total spent on food: $${foodSpending.toFixed(2)}\n`;
    if (foodSpending > 0) {
      const foodExpenses = data.expenses.filter(exp => exp.category === 'food');
      summary += `📝 Food expenses:\n`;
      foodExpenses.forEach(expense => {
        summary += `• ${expense.description}: $${expense.amount.toFixed(2)} (paid by ${expense.paidBy})\n`;
      });
    }
  } else {
    // General summary
    summary = `📋 Trip Summary for ${data.groupName}:\n\n`;
    summary += `💰 Total spent: $${data.totalAmount.toFixed(2)} across ${data.totalExpenses} expenses\n\n`;
    
    if (topSpender) {
      summary += `💸 Top spender: ${topSpender[0]} with $${topSpender[1].toFixed(2)}\n`;
    }
    
    if (topCategory) {
      summary += `📊 Top category: ${topCategory[0]} with $${topCategory[1].toFixed(2)}\n`;
    }
    
    summary += `\n👥 Current balances:\n`;
    if (data.balances.length === 0) {
      summary += `All settled up! 🎉`;
    } else {
      data.balances.forEach(balance => {
        summary += `• ${balance.from} owes ${balance.to}: $${balance.amount.toFixed(2)}\n`;
      });
    }
  }
  
  return summary;
}

module.exports = router;
