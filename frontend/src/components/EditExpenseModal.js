import React, { useState, useEffect } from 'react';
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
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Chip,
  Snackbar,
  IconButton,
  Grid,
  Avatar,
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const EditExpenseModal = ({ groupId, expenseId, expense, members, onClose, onExpenseUpdated }) => {
  const [formData, setFormData] = useState({
    paidBy: '',
    amount: '',
    description: '',
    splitBetween: [],
    splitType: 'equal',
    splitDetails: {}
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [splitAmounts, setSplitAmounts] = useState({});
  const [splitPercentages, setSplitPercentages] = useState({});

  useEffect(() => {
    // Initialize form data with existing expense
    if (expense) {
      setFormData({
        paidBy: expense.paidBy || '',
        amount: expense.amount || '',
        description: expense.description || '',
        splitBetween: expense.splitBetween || [],
        splitType: expense.splitType || 'equal',
        splitDetails: expense.splitDetails || {}
      });
    }
  }, [expense]);

  useEffect(() => {
    // Initialize split amounts when splitBetween changes
    if (formData.splitBetween.length > 0) {
      const newSplitAmounts = {};
      const newSplitPercentages = {};
      
      formData.splitBetween.forEach(memberId => {
        if (formData.splitType === 'equal') {
          newSplitAmounts[memberId] = (formData.amount / formData.splitBetween.length).toFixed(2);
        } else if (formData.splitType === 'percentage') {
          newSplitPercentages[memberId] = (100 / formData.splitBetween.length).toFixed(2);
        } else if (formData.splitType === 'exact_amounts') {
          newSplitAmounts[memberId] = '';
        }
      });
      
      setSplitAmounts(newSplitAmounts);
      setSplitPercentages(newSplitPercentages);
    }
  }, [formData.splitBetween, formData.splitType, formData.amount]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleMemberToggle = (memberId) => {
    const newSplitBetween = formData.splitBetween.includes(memberId)
      ? formData.splitBetween.filter(id => id !== memberId)
      : [...formData.splitBetween, memberId];
    
    handleInputChange('splitBetween', newSplitBetween);
  };

  const handleSplitAmountChange = (memberId, value) => {
    setSplitAmounts(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const handleSplitPercentageChange = (memberId, value) => {
    setSplitPercentages(prev => ({
      ...prev,
      [memberId]: value
    }));
  };

  const validateForm = () => {
    if (!formData.paidBy) {
      setMessage('Please select who paid for this expense');
      setMessageType('error');
      return false;
    }
    if (!formData.amount || formData.amount <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return false;
    }
    if (!formData.description.trim()) {
      setMessage('Please enter a description');
      setMessageType('error');
      return false;
    }
    if (formData.splitBetween.length === 0) {
      setMessage('Please select at least one person to split with');
      setMessageType('error');
      return false;
    }

    // Validate split details
    if (formData.splitType === 'exact_amounts') {
      const totalAmount = formData.splitBetween.reduce((sum, memberId) => {
        return sum + parseFloat(splitAmounts[memberId] || 0);
      }, 0);
      
      if (Math.abs(totalAmount - formData.amount) > 0.01) {
        setMessage('Exact amounts must sum to the total expense amount');
        setMessageType('error');
        return false;
      }
    } else if (formData.splitType === 'percentage') {
      const totalPercentage = formData.splitBetween.reduce((sum, memberId) => {
        return sum + parseFloat(splitPercentages[memberId] || 0);
      }, 0);
      
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setMessage('Percentages must sum to 100%');
        setMessageType('error');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      // Prepare split details based on split type
      let splitDetails = [];
      
      if (formData.splitType === 'exact_amounts') {
        splitDetails = formData.splitBetween.map(memberId => ({
          userId: memberId,
          amount: parseFloat(splitAmounts[memberId])
        }));
      } else if (formData.splitType === 'percentage') {
        splitDetails = formData.splitBetween.map(memberId => ({
          userId: memberId,
          percentage: parseFloat(splitPercentages[memberId])
        }));
      }

      await axios.put(API_BASE_URL + '/api/groups/' + groupId + '/expenses/' + expenseId, {
        paidBy: formData.paidBy,
        amount: parseFloat(formData.amount),
        description: formData.description,
        splitBetween: formData.splitBetween,
        splitType: formData.splitType,
        splitDetails: splitDetails
      });

      setSnackbar({
        open: true,
        message: 'Expense updated successfully!',
        severity: 'success'
      });

      setTimeout(() => {
        onExpenseUpdated();
        onClose();
      }, 1000);

    } catch (error) {
      console.error('Error updating expense:', error);
      setMessage(error.response?.data?.error || 'Failed to update expense');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    if (!userId || !Array.isArray(members)) return userId;
    const member = members.find(m => m && m.userId === userId);
    return member ? member.name : userId;
  };

  const getSplitPreview = () => {
    if (formData.splitBetween.length === 0) return null;

    const totalAmount = parseFloat(formData.amount) || 0;
    const splitCount = formData.splitBetween.length;

    if (formData.splitType === 'equal') {
      const amountPerPerson = (totalAmount / splitCount).toFixed(2);
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Split Preview (Equal):
          </Typography>
          {formData.splitBetween.map(memberId => (
            <Chip
              key={memberId}
              label={`${getUserName(memberId)}: ₹${amountPerPerson}`}
              size="small"
              sx={{ mr: 1, mb: 1 }}
            />
          ))}
        </Box>
      );
    } else if (formData.splitType === 'percentage') {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Split Preview (Percentage):
          </Typography>
          {formData.splitBetween.map(memberId => {
            const percentage = parseFloat(splitPercentages[memberId] || 0);
            const amount = ((totalAmount * percentage) / 100).toFixed(2);
            return (
              <Chip
                key={memberId}
                label={`${getUserName(memberId)}: ${percentage}% (₹${amount})`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            );
          })}
        </Box>
      );
    } else if (formData.splitType === 'exact_amounts') {
      return (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Split Preview (Exact Amounts):
          </Typography>
          {formData.splitBetween.map(memberId => {
            const amount = splitAmounts[memberId] || '0.00';
            return (
              <Chip
                key={memberId}
                label={`${getUserName(memberId)}: ₹${amount}`}
                size="small"
                sx={{ mr: 1, mb: 1 }}
              />
            );
          })}
        </Box>
      );
    }

    return null;
  };

  return (
    <>
      <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center">
              <EditIcon sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Edit Expense</Typography>
            </Box>
            <IconButton onClick={onClose} size="small">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent>
          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
            {message && (
              <Alert severity={messageType} sx={{ mb: 2 }}>
                {message}
              </Alert>
            )}

            <Grid container spacing={3}>
              {/* Paid By */}
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Paid By</InputLabel>
                  <Select
                    value={formData.paidBy}
                    onChange={(e) => handleInputChange('paidBy', e.target.value)}
                    label="Paid By"
                  >
                    {members.map(member => (
                      <MenuItem key={member.userId} value={member.userId}>
                        <Box display="flex" alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, mr: 1, bgcolor: 'primary.main' }}>
                            {member.name.charAt(0)}
                          </Avatar>
                          {member.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              {/* Amount */}
              <Grid item xs={12} md={6}>
                <TextField
                  fullWidth
                  label="Amount"
                  type="number"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                  InputProps={{
                    startAdornment: <MoneyIcon sx={{ mr: 1, color: 'text.secondary' }} />
                  }}
                  inputProps={{ min: 0, step: 0.01 }}
                />
              </Grid>

              {/* Description */}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  multiline
                  rows={2}
                />
              </Grid>

              {/* Split Type */}
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel>Split Type</InputLabel>
                  <Select
                    value={formData.splitType}
                    onChange={(e) => handleInputChange('splitType', e.target.value)}
                    label="Split Type"
                  >
                    <MenuItem value="equal">Equal Split</MenuItem>
                    <MenuItem value="percentage">Percentage Split</MenuItem>
                    <MenuItem value="exact_amounts">Exact Amounts</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              {/* Split Between */}
              <Grid item xs={12}>
                <Typography variant="subtitle1" sx={{ mb: 2 }}>
                  Split Between:
                </Typography>
                <Box display="flex" flexWrap="wrap" gap={1}>
                  {members.map(member => (
                    <Chip
                      key={member.userId}
                      label={member.name}
                      onClick={() => handleMemberToggle(member.userId)}
                      color={formData.splitBetween.includes(member.userId) ? 'primary' : 'default'}
                      variant={formData.splitBetween.includes(member.userId) ? 'filled' : 'outlined'}
                      avatar={
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          {member.name.charAt(0)}
                        </Avatar>
                      }
                    />
                  ))}
                </Box>
              </Grid>

              {/* Split Details */}
              {formData.splitType === 'exact_amounts' && formData.splitBetween.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Enter Exact Amounts:
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.splitBetween.map(memberId => (
                      <Grid item xs={12} sm={6} key={memberId}>
                        <TextField
                          fullWidth
                          label={`${getUserName(memberId)}'s Amount`}
                          type="number"
                          value={splitAmounts[memberId] || ''}
                          onChange={(e) => handleSplitAmountChange(memberId, e.target.value)}
                          inputProps={{ min: 0, step: 0.01 }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {formData.splitType === 'percentage' && formData.splitBetween.length > 0 && (
                <Grid item xs={12}>
                  <Typography variant="subtitle1" sx={{ mb: 2 }}>
                    Enter Percentages:
                  </Typography>
                  <Grid container spacing={2}>
                    {formData.splitBetween.map(memberId => (
                      <Grid item xs={12} sm={6} key={memberId}>
                        <TextField
                          fullWidth
                          label={`${getUserName(memberId)}'s Percentage`}
                          type="number"
                          value={splitPercentages[memberId] || ''}
                          onChange={(e) => handleSplitPercentageChange(memberId, e.target.value)}
                          inputProps={{ min: 0, max: 100, step: 0.01 }}
                          InputProps={{
                            endAdornment: <Typography variant="body2">%</Typography>
                          }}
                        />
                      </Grid>
                    ))}
                  </Grid>
                </Grid>
              )}

              {/* Split Preview */}
              {getSplitPreview()}
            </Grid>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 3 }}>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <EditIcon />}
          >
            {loading ? 'Updating...' : 'Update Expense'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        message={snackbar.message}
      />
    </>
  );
};

export default EditExpenseModal;
