const CURRENCY = {
  SYMBOL: '₹',
  CODE: 'INR',
  DECIMAL_PLACES: 2
};

const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_SERVER_ERROR: 500
};

const EXPENSE_CATEGORIES = [
  'food',
  'travel',
  'accommodation',
  'entertainment',
  'shopping',
  'transportation',
  'utilities',
  'healthcare',
  'education',
  'other'
];

const SPLIT_TYPES = {
  EQUAL: 'equal',
  PERCENTAGE: 'percentage',
  EXACT_AMOUNTS: 'exact_amounts'
};

const AI_MODELS = {
  GPT_3_5_TURBO: 'gpt-3.5-turbo',
  GPT_4: 'gpt-4'
};

const VALIDATION_MESSAGES = {
  REQUIRED: 'This field is required',
  INVALID_EMAIL: 'Please provide a valid email address',
  INVALID_AMOUNT: 'Amount must be greater than 0',
  INVALID_SPLIT_TYPE: 'Invalid split type',
  INVALID_CATEGORY: 'Invalid expense category',
  MIN_MEMBERS: 'At least one member is required',
  PERCENTAGE_SUM: 'Percentages must sum to 100',
  AMOUNT_SUM: 'Exact amounts must sum to total expense amount'
};

const ERROR_MESSAGES = {
  GROUP_NOT_FOUND: 'Group not found',
  USER_NOT_FOUND: 'User not found',
  EXPENSE_NOT_FOUND: 'Expense not found',
  INTERNAL_ERROR: 'Internal server error',
  VALIDATION_ERROR: 'Validation error',
  AI_SERVICE_ERROR: 'AI service temporarily unavailable',
  DATABASE_ERROR: 'Database operation failed'
};

const SUCCESS_MESSAGES = {
  USER_CREATED: 'User created successfully',
  GROUP_CREATED: 'Group created successfully',
  EXPENSE_ADDED: 'Expense added successfully',
  EXPENSE_UPDATED: 'Expense updated successfully',
  EXPENSE_DELETED: 'Expense deleted successfully',
  BALANCE_SETTLED: 'Balance settled successfully',
  SUMMARY_GENERATED: 'Summary generated successfully'
};

const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug'
};

const API_ENDPOINTS = {
  USERS: '/api/users',
  GROUPS: '/api/groups',
  HEALTH: '/health'
};

const DATABASE_CONFIG = {
  CONNECTION_OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
};

const AI_CONFIG = {
  MAX_TOKENS: 500,
  TEMPERATURE: 0.7,
  TIMEOUT: 30000
};

module.exports = {
  CURRENCY,
  HTTP_STATUS,
  EXPENSE_CATEGORIES,
  SPLIT_TYPES,
  AI_MODELS,
  VALIDATION_MESSAGES,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  LOG_LEVELS,
  API_ENDPOINTS,
  DATABASE_CONFIG,
  AI_CONFIG
};
