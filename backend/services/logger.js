const { LOG_LEVELS } = require('../constants');

class Logger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || LOG_LEVELS.INFO;
  }

  formatMessage(level, message, meta = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      ...meta
    };
    return JSON.stringify(logEntry);
  }

  log(level, message, meta = {}) {
    if (this.shouldLog(level)) {
      console.log(this.formatMessage(level, message, meta));
    }
  }

  shouldLog(level) {
    const levels = [LOG_LEVELS.ERROR, LOG_LEVELS.WARN, LOG_LEVELS.INFO, LOG_LEVELS.DEBUG];
    const currentLevelIndex = levels.indexOf(this.logLevel);
    const messageLevelIndex = levels.indexOf(level);
    return messageLevelIndex <= currentLevelIndex;
  }

  error(message, meta = {}) {
    this.log(LOG_LEVELS.ERROR, message, meta);
  }

  warn(message, meta = {}) {
    this.log(LOG_LEVELS.WARN, message, meta);
  }

  info(message, meta = {}) {
    this.log(LOG_LEVELS.INFO, message, meta);
  }

  debug(message, meta = {}) {
    this.log(LOG_LEVELS.DEBUG, message, meta);
  }

  logApiRequest(method, url, body = {}) {
    this.info('API Request', {
      method,
      url,
      body: this.sanitizeBody(body)
    });
  }

  logApiResponse(method, url, statusCode, responseTime) {
    this.info('API Response', {
      method,
      url,
      statusCode,
      responseTime: `${responseTime}ms`
    });
  }

  logDatabaseOperation(operation, collection, query = {}) {
    this.debug('Database Operation', {
      operation,
      collection,
      query: this.sanitizeQuery(query)
    });
  }

  logAiServiceCall(service, query, responseTime) {
    this.info('AI Service Call', {
      service,
      query: query.substring(0, 100) + '...',
      responseTime: `${responseTime}ms`
    });
  }

  logError(error, context = {}) {
    this.error('Application Error', {
      message: error.message,
      stack: error.stack,
      ...context
    });
  }

  sanitizeBody(body) {
    const sanitized = { ...body };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    if (sanitized.apiKey) sanitized.apiKey = '[REDACTED]';
    return sanitized;
  }

  sanitizeQuery(query) {
    const sanitized = { ...query };
    if (sanitized.password) sanitized.password = '[REDACTED]';
    return sanitized;
  }
}

module.exports = new Logger();
