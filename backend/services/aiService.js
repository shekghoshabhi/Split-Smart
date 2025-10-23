const axios = require('axios');
const { AI_MODELS, AI_CONFIG, EXPENSE_CATEGORIES, CURRENCY } = require('../constants');
const logger = require('./logger');
const { handleAiServiceError } = require('../utils/errorHandler');

class AIExpenseCategorizer {
  constructor() {
    this.apiKey = process.env.OPENAI_API_KEY;
    this.baseURL = 'https://api.openai.com/v1';
  }

  async categorizeExpense(description) {
    if (!this.apiKey) {
      logger.warn('AI categorization skipped - no API key');
      return this.fallbackCategorization(description);
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: AI_MODELS.GPT_3_5_TURBO,
          messages: [
            {
              role: 'system',
              content: `You are an expense categorization assistant. Categorize the given expense description into one of these categories: ${EXPENSE_CATEGORIES.join(', ')}. Respond with only the category name.`
            },
            {
              role: 'user',
              content: `Categorize this expense: "${description}"`
            }
          ],
          max_tokens: 10,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: AI_CONFIG.TIMEOUT
        }
      );

      const responseTime = Date.now() - startTime;
      logger.logAiServiceCall('categorization', description, responseTime);

      const category = response.data.choices[0].message.content.trim().toLowerCase();
      return this.validateCategory(category);
    } catch (error) {
      logger.logError(error, { 
        type: 'ai_categorization',
        description,
        duration: Date.now() - startTime
      });
      return this.fallbackCategorization(description);
    }
  }

  async generateSmartSummary(query, data) {
    logger.info('AI Summary Request', { 
      query: query, 
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      dataKeys: Object.keys(data)
    });

    if (!this.apiKey) {
      logger.warn('AI summary generation skipped - no API key');
      return this.generateFallbackSummary(query, data);
    }

    const startTime = Date.now();
    
    try {
      const prompt = this.buildSummaryPrompt(query, data);
      logger.debug('AI Prompt', { prompt: prompt.substring(0, 200) + '...' });
      
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: AI_MODELS.GPT_3_5_TURBO,
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
          max_tokens: AI_CONFIG.MAX_TOKENS,
          temperature: AI_CONFIG.TEMPERATURE
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: AI_CONFIG.TIMEOUT
        }
      );

      const responseTime = Date.now() - startTime;
      logger.logAiServiceCall('summary_generation', query, responseTime);
      logger.info('AI Response Success', { 
        responseLength: response.data.choices[0].message.content.length,
        usage: response.data.usage
      });

      return response.data.choices[0].message.content.trim();
    } catch (error) {
      logger.logError(error, { 
        type: 'ai_summary',
        query,
        duration: Date.now() - startTime,
        errorStatus: error.response?.status,
        errorMessage: error.response?.data?.error?.message
      });
      return this.generateFallbackSummary(query, data);
    }
  }

  async suggestOptimalSettlement(balances) {
    if (!this.apiKey) {
      logger.warn('AI settlement optimization skipped - no API key');
      return this.fallbackSettlementStrategy(balances);
    }

    const startTime = Date.now();
    
    try {
      const response = await axios.post(
        `${this.baseURL}/chat/completions`,
        {
          model: AI_MODELS.GPT_3_5_TURBO,
          messages: [
            {
              role: 'system',
              content: 'You are a financial optimization assistant. Given a list of balances between people, suggest the minimum number of transactions needed to settle all debts. Respond with a JSON array of transactions in the format [{"from": "user1", "to": "user2", "amount": 100}].'
            },
            {
              role: 'user',
              content: `Optimize these balances: ${JSON.stringify(balances)}`
            }
          ],
          max_tokens: 200,
          temperature: 0.1
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: AI_CONFIG.TIMEOUT
        }
      );

      const responseTime = Date.now() - startTime;
      logger.logAiServiceCall('settlement_optimization', JSON.stringify(balances), responseTime);

      const suggestion = response.data.choices[0].message.content.trim();
      return JSON.parse(suggestion);
    } catch (error) {
      logger.logError(error, { 
        type: 'ai_settlement',
        balances,
        duration: Date.now() - startTime
      });
      return this.fallbackSettlementStrategy(balances);
    }
  }

  buildSummaryPrompt(query, data) {
    return `
You are a helpful expense analysis assistant. Analyze the following trip expense data and provide a conversational summary based on the user's query.

User Query: "${query || 'Provide a general summary of this trip'}"
Group Name: ${data.groupName}
Total Expenses: ${data.totalExpenses}
Total Amount: ${CURRENCY.SYMBOL}${data.totalAmount.toFixed(CURRENCY.DECIMAL_PLACES)}

Expenses:
${data.expenses.map(expense => 
  `- ${expense.description}: ${CURRENCY.SYMBOL}${expense.amount.toFixed(CURRENCY.DECIMAL_PLACES)} (paid by ${expense.paidBy}, split between ${expense.splitBetween.join(', ')}, category: ${expense.category})`
).join('\n')}

Spending by Person:
${Object.entries(data.spendingByPerson).map(([person, amount]) => 
  `- ${person}: ${CURRENCY.SYMBOL}${amount.toFixed(CURRENCY.DECIMAL_PLACES)}`
).join('\n')}

Spending by Category:
${Object.entries(data.spendingByCategory).map(([category, amount]) => 
  `- ${category}: ${CURRENCY.SYMBOL}${amount.toFixed(CURRENCY.DECIMAL_PLACES)}`
).join('\n')}

Current Balances:
${data.balances.map(balance => 
  `- ${balance.from} owes ${balance.to}: ${CURRENCY.SYMBOL}${balance.amount.toFixed(CURRENCY.DECIMAL_PLACES)}`
).join('\n')}

Please provide a conversational, friendly summary that answers the user's query. Include insights about:
1. Total spending and expense breakdown
2. Who spent the most/least
3. Most expensive categories
4. Current balance situation
5. Any interesting patterns or insights

Keep the response conversational and helpful, as if you're talking to a friend about their trip expenses. Use ${CURRENCY.SYMBOL} symbol for all monetary amounts.
`;
  }

  fallbackCategorization(description) {
    const desc = description.toLowerCase();
    
    const categories = {
      food: ['restaurant', 'food', 'dining', 'meal', 'cafe', 'pizza', 'burger', 'lunch', 'dinner', 'breakfast'],
      travel: ['hotel', 'flight', 'travel', 'trip', 'vacation', 'booking', 'airbnb'],
      accommodation: ['hotel', 'accommodation', 'lodging', 'stay', 'room'],
      entertainment: ['movie', 'cinema', 'game', 'entertainment', 'concert', 'show', 'theater'],
      shopping: ['shopping', 'store', 'mall', 'clothes', 'fashion', 'retail'],
      transportation: ['taxi', 'uber', 'bus', 'train', 'metro', 'fuel', 'gas', 'parking'],
      utilities: ['electricity', 'water', 'internet', 'phone', 'utility', 'bill'],
      healthcare: ['doctor', 'hospital', 'medicine', 'pharmacy', 'health', 'medical'],
      education: ['school', 'university', 'course', 'book', 'education', 'learning']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => desc.includes(keyword))) {
        return category;
      }
    }

    return 'other';
  }

  generateFallbackSummary(query, data) {
    const topSpender = Object.entries(data.spendingByPerson)
      .sort(([,a], [,b]) => b - a)[0];
    const topCategory = Object.entries(data.spendingByCategory)
      .sort(([,a], [,b]) => b - a)[0];
    
    const queryLower = query.toLowerCase();
    let summary = '';
    
    logger.info('Using fallback summary', { query: queryLower });
    
    if (queryLower.includes('who spent') || queryLower.includes('biggest spender') || queryLower.includes('most overall') || queryLower.includes('highest spender')) {
      summary = `💰 Spending Analysis for ${data.groupName}:\n\n`;
      if (topSpender) {
        summary += `💸 Top spender: ${topSpender[0]} with ${CURRENCY.SYMBOL}${topSpender[1].toFixed(CURRENCY.DECIMAL_PLACES)}\n\n`;
      }
      summary += `📊 All spending breakdown:\n`;
      Object.entries(data.spendingByPerson)
        .sort(([,a], [,b]) => b - a)
        .forEach(([person, amount]) => {
          summary += `• ${person}: ${CURRENCY.SYMBOL}${amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
    } else if (queryLower.includes('category') || queryLower.includes('categories') || queryLower.includes('biggest expense') || queryLower.includes('expense categories')) {
      summary = `📊 Expense Categories for ${data.groupName}:\n\n`;
      if (topCategory) {
        summary += `🏆 Top category: ${topCategory[0]} with ${CURRENCY.SYMBOL}${topCategory[1].toFixed(CURRENCY.DECIMAL_PLACES)}\n\n`;
      }
      summary += `📈 All categories:\n`;
      Object.entries(data.spendingByCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
          summary += `• ${category}: ${CURRENCY.SYMBOL}${amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
    } else if (queryLower.includes('balance') || queryLower.includes('owe') || queryLower.includes('debt') || queryLower.includes('outstanding') || queryLower.includes('who owes')) {
      summary = `👥 Current Balances for ${data.groupName}:\n\n`;
      if (data.balances.length === 0) {
        summary += `🎉 All settled up! No outstanding balances.\n`;
      } else {
        summary += `📋 Outstanding debts:\n`;
        data.balances.forEach(balance => {
          summary += `• ${balance.from} owes ${balance.to}: ${CURRENCY.SYMBOL}${balance.amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
      }
    } else if (queryLower.includes('food') || queryLower.includes('dining') || queryLower.includes('restaurant') || queryLower.includes('meal')) {
      const foodSpending = data.spendingByCategory.food || 0;
      summary = `🍽️ Food & Dining for ${data.groupName}:\n\n`;
      summary += `💰 Total spent on food: ${CURRENCY.SYMBOL}${foodSpending.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
      if (foodSpending > 0) {
        const foodExpenses = data.expenses.filter(exp => exp.category === 'food');
        summary += `📝 Food expenses:\n`;
        foodExpenses.forEach(expense => {
          summary += `• ${expense.description}: ${CURRENCY.SYMBOL}${expense.amount.toFixed(CURRENCY.DECIMAL_PLACES)} (paid by ${expense.paidBy})\n`;
        });
      }
    } else if (queryLower.includes('travel') || queryLower.includes('transport') || queryLower.includes('hotel') || queryLower.includes('accommodation')) {
      const travelSpending = data.spendingByCategory.travel || 0;
      const accommodationSpending = data.spendingByCategory.accommodation || 0;
      const totalTravel = travelSpending + accommodationSpending;
      summary = `✈️ Travel & Accommodation for ${data.groupName}:\n\n`;
      summary += `💰 Total spent on travel: ${CURRENCY.SYMBOL}${totalTravel.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
      if (travelSpending > 0) summary += `• Travel: ${CURRENCY.SYMBOL}${travelSpending.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
      if (accommodationSpending > 0) summary += `• Accommodation: ${CURRENCY.SYMBOL}${accommodationSpending.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
    } else if (queryLower.includes('entertainment') || queryLower.includes('fun') || queryLower.includes('movie') || queryLower.includes('game')) {
      const entertainmentSpending = data.spendingByCategory.entertainment || 0;
      summary = `🎬 Entertainment for ${data.groupName}:\n\n`;
      summary += `💰 Total spent on entertainment: ${CURRENCY.SYMBOL}${entertainmentSpending.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
      if (entertainmentSpending > 0) {
        const entertainmentExpenses = data.expenses.filter(exp => exp.category === 'entertainment');
        summary += `📝 Entertainment expenses:\n`;
        entertainmentExpenses.forEach(expense => {
          summary += `• ${expense.description}: ${CURRENCY.SYMBOL}${expense.amount.toFixed(CURRENCY.DECIMAL_PLACES)} (paid by ${expense.paidBy})\n`;
        });
      }
    } else if (queryLower.includes('summary') || queryLower.includes('overview') || queryLower.includes('trip summary') || queryLower.includes('expense summary')) {
      summary = `📋 Trip Summary for ${data.groupName}:\n\n`;
      summary += `💰 Total spent: ${CURRENCY.SYMBOL}${data.totalAmount.toFixed(CURRENCY.DECIMAL_PLACES)} across ${data.totalExpenses} expenses\n\n`;
      
      if (topSpender) {
        summary += `💸 Top spender: ${topSpender[0]} with ${CURRENCY.SYMBOL}${topSpender[1].toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
      }
      
      if (topCategory) {
        summary += `📊 Top category: ${topCategory[0]} with ${CURRENCY.SYMBOL}${topCategory[1].toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
      }
      
      summary += `\n👥 Current balances:\n`;
      if (data.balances.length === 0) {
        summary += `All settled up! 🎉`;
      } else {
        data.balances.forEach(balance => {
          summary += `• ${balance.from} owes ${balance.to}: ${CURRENCY.SYMBOL}${balance.amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
      }
    } else {
      summary = `🤖 Custom Analysis for ${data.groupName}:\n\n`;
      summary += `Based on your question "${query}", here's what I found:\n\n`;
      summary += `💰 Total spent: ${CURRENCY.SYMBOL}${data.totalAmount.toFixed(CURRENCY.DECIMAL_PLACES)} across ${data.totalExpenses} expenses\n\n`;
      
      if (topSpender) {
        summary += `💸 Highest spender: ${topSpender[0]} (${CURRENCY.SYMBOL}${topSpender[1].toFixed(CURRENCY.DECIMAL_PLACES)})\n`;
      }
      
      if (topCategory) {
        summary += `📊 Biggest category: ${topCategory[0]} (${CURRENCY.SYMBOL}${topCategory[1].toFixed(CURRENCY.DECIMAL_PLACES)})\n`;
      }
      
      summary += `\n📈 All spending by person:\n`;
      Object.entries(data.spendingByPerson)
        .sort(([,a], [,b]) => b - a)
        .forEach(([person, amount]) => {
          summary += `• ${person}: ${CURRENCY.SYMBOL}${amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
      
      summary += `\n📊 All spending by category:\n`;
      Object.entries(data.spendingByCategory)
        .sort(([,a], [,b]) => b - a)
        .forEach(([category, amount]) => {
          summary += `• ${category}: ${CURRENCY.SYMBOL}${amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
      
      if (data.balances.length > 0) {
        summary += `\n👥 Outstanding balances:\n`;
        data.balances.forEach(balance => {
          summary += `• ${balance.from} owes ${balance.to}: ${CURRENCY.SYMBOL}${balance.amount.toFixed(CURRENCY.DECIMAL_PLACES)}\n`;
        });
      } else {
        summary += `\n🎉 All balances are settled!`;
      }
    }
    
    return summary;
  }

  fallbackSettlementStrategy(balances) {
    const transactions = [];
    const netBalances = {};
    
    balances.forEach(balance => {
      netBalances[balance.from] = (netBalances[balance.from] || 0) - balance.amount;
      netBalances[balance.to] = (netBalances[balance.to] || 0) + balance.amount;
    });

    const creditors = Object.entries(netBalances)
      .filter(([_, amount]) => amount > 0)
      .sort((a, b) => b[1] - a[1]);
    
    const debtors = Object.entries(netBalances)
      .filter(([_, amount]) => amount < 0)
      .sort((a, b) => a[1] - b[1]);

    let creditorIndex = 0;
    let debtorIndex = 0;

    while (creditorIndex < creditors.length && debtorIndex < debtors.length) {
      const [creditor, creditAmount] = creditors[creditorIndex];
      const [debtor, debtAmount] = debtors[debtorIndex];
      
      const amount = Math.min(creditAmount, Math.abs(debtAmount));
      
      if (amount > 0) {
        transactions.push({
          from: debtor,
          to: creditor,
          amount: parseFloat(amount.toFixed(4))
        });
      }
      
      creditors[creditorIndex][1] -= amount;
      debtors[debtorIndex][1] += amount;
      
      if (creditors[creditorIndex][1] === 0) creditorIndex++;
      if (debtors[debtorIndex][1] === 0) debtorIndex++;
    }

    return transactions;
  }

  validateCategory(category) {
    return EXPENSE_CATEGORIES.includes(category) ? category : 'other';
  }
}

module.exports = AIExpenseCategorizer;