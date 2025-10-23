require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const { DATABASE_CONFIG, API_ENDPOINTS } = require('./constants');
const { sendErrorResponse } = require('./utils/errorHandler');
const logger = require('./services/logger');

const userRoutes = require('./routes/userRoutes');
const groupRoutes = require('./routes/groupRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI, DATABASE_CONFIG.CONNECTION_OPTIONS)
  .then(() => {
    logger.info('Connected to MongoDB successfully');
  })
  .catch((error) => {
    logger.logError(error, { type: 'database_connection' });
    process.exit(1);
  });

app.use(API_ENDPOINTS.USERS, userRoutes);
app.use(API_ENDPOINTS.GROUPS, groupRoutes);

app.get(API_ENDPOINTS.HEALTH, (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.use(sendErrorResponse);

app.listen(PORT, () => {
  logger.info(`Server running on port ${PORT}`);
});

module.exports = app;
