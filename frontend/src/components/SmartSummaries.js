import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Chip,
  IconButton,
  Grid,
  Paper,
} from '@mui/material';
import {
  SmartToy as AIIcon,
  Close as CloseIcon,
  Send as SendIcon,
  TrendingUp as TrendingUpIcon,
  Person as PersonIcon,
  Category as CategoryIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';

const SmartSummaries = ({ groupId, groupName, onClose }) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState('');
  const [summaryData, setSummaryData] = useState(null);
  const [error, setError] = useState('');

  const predefinedQueries = [
    "Summarize our trip expenses",
    "Who spent the most overall?",
    "What were our biggest expense categories?",
    "Show me spending patterns",
    "How much did we spend on food?",
    "Who owes money to whom?"
  ];

  const handleQuerySubmit = async (queryText = query) => {
    if (!queryText.trim()) {
      setError('Please enter a question or select a predefined query');
      return;
    }

    setLoading(true);
    setError('');
    setSummary('');

    try {
      const response = await axios.post(API_BASE_URL + '/api/groups/' + groupId + '/summaries', {
        query: queryText
      });

      const responseData = response.data.data || response.data;
      setSummary(responseData.summary || 'No summary available');
      setSummaryData(responseData.data || {
        spendingByPerson: {},
        spendingByCategory: {},
        balances: [],
        totalExpenses: 0,
        totalAmount: 0,
        members: []
      });
    } catch (error) {
      console.error('Error generating summary:', error);
      setError('Failed to generate summary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePredefinedQuery = (predefinedQuery) => {
    setQuery(predefinedQuery);
    handleQuerySubmit(predefinedQuery);
  };

  const formatCurrency = (amount) => {
    return `₹${amount.toFixed(2)}`;
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <AIIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6">Smart Summaries</Typography>
            <Chip 
              label={groupName} 
              size="small" 
              color="primary" 
              sx={{ ml: 2 }} 
            />
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box sx={{ mt: 2 }}>
          {/* Predefined Queries */}
          <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
            Quick Questions:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1} sx={{ mb: 3 }}>
            {predefinedQueries.map((predefinedQuery, index) => (
              <Chip
                key={index}
                label={predefinedQuery}
                onClick={() => handlePredefinedQuery(predefinedQuery)}
                variant="outlined"
                clickable
                sx={{ mb: 1 }}
              />
            ))}
          </Box>

          {/* Custom Query Input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 'bold' }}>
              Ask a Custom Question:
            </Typography>
            <Box display="flex" gap={1}>
              <TextField
                fullWidth
                placeholder="e.g., Who spent the most on entertainment?"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleQuerySubmit()}
                disabled={loading}
              />
              <Button
                variant="contained"
                onClick={() => handleQuerySubmit()}
                disabled={loading || !query.trim()}
                startIcon={loading ? <CircularProgress size={20} /> : <SendIcon />}
              >
                Ask
              </Button>
            </Box>
          </Box>

          {/* Error Display */}
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {/* Loading State */}
          {loading && (
            <Box textAlign="center" py={4}>
              <CircularProgress size={60} />
              <Typography variant="body1" sx={{ mt: 2 }}>
                Analyzing your expenses...
              </Typography>
            </Box>
          )}

          {/* Summary Display */}
          {summary && (
            <Card elevation={2}>
              <CardContent>
                <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                  <AIIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                  AI Summary
                </Typography>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: 2, 
                    bgcolor: 'grey.50', 
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'grey.200'
                  }}
                >
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      whiteSpace: 'pre-line',
                      lineHeight: 1.6
                    }}
                  >
                    {summary}
                  </Typography>
                </Paper>
              </CardContent>
            </Card>
          )}

          {/* Detailed Data Display */}
          {summaryData && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold' }}>
                Detailed Breakdown
              </Typography>
              
              <Grid container spacing={2}>
                {/* Spending by Person */}
                <Grid item xs={12} md={6}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Spending by Person
                      </Typography>
                      {summaryData.spendingByPerson && Object.entries(summaryData.spendingByPerson).length > 0 ? (
                        Object.entries(summaryData.spendingByPerson)
                          .sort(([,a], [,b]) => b - a)
                          .map(([person, amount]) => (
                            <Box key={person} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2">{person}</Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(amount)}
                              </Typography>
                            </Box>
                          ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No spending data available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Spending by Category */}
                <Grid item xs={12} md={6}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        <CategoryIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Spending by Category
                      </Typography>
                      {summaryData.spendingByCategory && Object.entries(summaryData.spendingByCategory).length > 0 ? (
                        Object.entries(summaryData.spendingByCategory)
                          .sort(([,a], [,b]) => b - a)
                          .map(([category, amount]) => (
                            <Box key={category} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                                {category}
                              </Typography>
                              <Typography variant="body2" fontWeight="bold">
                                {formatCurrency(amount)}
                              </Typography>
                            </Box>
                          ))
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          No category data available
                        </Typography>
                      )}
                    </CardContent>
                  </Card>
                </Grid>

                {/* Current Balances */}
                {summaryData.balances && summaryData.balances.length > 0 && (
                  <Grid item xs={12}>
                    <Card elevation={1}>
                      <CardContent>
                        <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                          <BalanceIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                          Current Balances
                        </Typography>
                        {summaryData.balances && summaryData.balances.map((balance, index) => (
                          <Box key={index} display="flex" justifyContent="space-between" sx={{ mb: 1 }}>
                            <Typography variant="body2">
                              {balance.from} owes {balance.to}
                            </Typography>
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                              {formatCurrency(balance.amount)}
                            </Typography>
                          </Box>
                        ))}
                      </CardContent>
                    </Card>
                  </Grid>
                )}

                {/* Summary Stats */}
                <Grid item xs={12}>
                  <Card elevation={1}>
                    <CardContent>
                      <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 'bold' }}>
                        <TrendingUpIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
                        Trip Summary
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="primary.main" fontWeight="bold">
                              {summaryData.totalExpenses || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Expenses
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="success.main" fontWeight="bold">
                              {formatCurrency(summaryData.totalAmount || 0)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Total Spent
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color="info.main" fontWeight="bold">
                              {summaryData.members?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Members
                            </Typography>
                          </Box>
                        </Grid>
                        <Grid item xs={6} sm={3}>
                          <Box textAlign="center">
                            <Typography variant="h4" color={(summaryData.balances?.length || 0) === 0 ? "success.main" : "warning.main"} fontWeight="bold">
                              {summaryData.balances?.length || 0}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              Outstanding Balances
                            </Typography>
                          </Box>
                        </Grid>
                      </Grid>
                    </CardContent>
                  </Card>
                </Grid>
              </Grid>
            </Box>
          )}
        </Box>
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} disabled={loading}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SmartSummaries;
