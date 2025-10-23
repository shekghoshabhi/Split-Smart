import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  Card,
  CardContent,
  Grid,
  Avatar,
} from '@mui/material';
import { 
  AttachMoney as MoneyIcon,
  Add as AddIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

const AddExpenseModal = ({ groupId, members, onClose, onExpenseAdded }) => {
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
    // Initialize split amounts when splitBetween changes
    if (formData.splitBetween.length > 0) {
      const newSplitAmounts = {};
      const newSplitPercentages = {};
      
      formData.splitBetween.forEach(memberId => {
        if (formData.splitType === 'equal') {
          newSplitAmounts[memberId] = (parseFloat(formData.amount) / formData.splitBetween.length).toFixed(2);
        } else if (formData.splitType === 'percentage') {
          newSplitPercentages[memberId] = (100 / formData.splitBetween.length).toFixed(2);
        } else {
          newSplitAmounts[memberId] = '';
        }
      });
      
      setSplitAmounts(newSplitAmounts);
      setSplitPercentages(newSplitPercentages);
    }
  }, [formData.splitBetween, formData.splitType, formData.amount]);

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSplitMemberChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      splitBetween: prev.splitBetween.includes(userId)
        ? prev.splitBetween.filter(id => id !== userId)
        : [...prev.splitBetween, userId]
    }));
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

  const calculateSplitAmounts = () => {
    const total = parseFloat(formData.amount) || 0;
    const splitCount = formData.splitBetween.length;
    
    if (formData.splitType === 'equal') {
      const amountPerPerson = total / splitCount;
      const amounts = {};
      formData.splitBetween.forEach(memberId => {
        amounts[memberId] = amountPerPerson.toFixed(2);
      });
      return amounts;
    } else if (formData.splitType === 'percentage') {
      const amounts = {};
      formData.splitBetween.forEach(memberId => {
        const percentage = parseFloat(splitPercentages[memberId]) || 0;
        amounts[memberId] = (total * percentage / 100).toFixed(2);
      });
      return amounts;
    } else {
      return splitAmounts;
    }
  };

  const validateForm = () => {
    if (!formData.description.trim()) {
      setMessage('Please enter expense description');
      setMessageType('error');
      return false;
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      setMessage('Please enter a valid amount');
      setMessageType('error');
      return false;
    }
    if (!formData.paidBy) {
      setMessage('Please select who paid');
      setMessageType('error');
      return false;
    }
    if (formData.splitBetween.length === 0) {
      setMessage('Please select at least one person for split');
      setMessageType('error');
      return false;
    }
    
    // Validate split amounts
    if (formData.splitType === 'exact_amounts') {
      const totalSplit = Object.values(splitAmounts).reduce((sum, amount) => sum + parseFloat(amount || 0), 0);
      const totalAmount = parseFloat(formData.amount);
      if (Math.abs(totalSplit - totalAmount) > 0.01) {
        setMessage(`Split amounts (₹${totalSplit.toFixed(2)}) must equal total amount (₹${totalAmount.toFixed(2)})`);
        setMessageType('error');
        return false;
      }
    } else if (formData.splitType === 'percentage') {
      const totalPercentage = Object.values(splitPercentages).reduce((sum, pct) => sum + parseFloat(pct || 0), 0);
      if (Math.abs(totalPercentage - 100) > 0.01) {
        setMessage(`Percentages must add up to 100% (currently ${totalPercentage.toFixed(2)}%)`);
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
    setMessageType('');

    try {
      const splitDetails = calculateSplitAmounts();
      const expenseData = {
        ...formData,
        amount: parseFloat(formData.amount),
        splitDetails: formData.splitType === 'percentage' ? splitPercentages : splitDetails
      };

      await axios.post(`/api/groups/${groupId}/expenses`, expenseData);
      showSnackbar('Expense added successfully!');
      onExpenseAdded();
      onClose();
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error adding expense');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  const getSplitPreview = () => {
    if (formData.splitBetween.length === 0 || !formData.amount) return null;
    
    const amounts = calculateSplitAmounts();
    const total = parseFloat(formData.amount);
    
    return (
      <Card sx={{ mt: 2, backgroundColor: '#F8F9FA' }}>
        <CardContent>
          <Typography variant="subtitle2" gutterBottom sx={{ fontWeight: 'bold' }}>
            Split Preview:
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={1}>
            {formData.splitBetween.map(memberId => {
              const member = members.find(m => m && m.userId === memberId);
              const amount = amounts[memberId];
              return (
                <Chip
                  key={memberId}
                  label={`${member?.name}: ₹${amount}`}
                  color="primary"
                  variant="outlined"
                  size="small"
                />
              );
            })}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Total: ₹{total.toFixed(2)} • Per person: ₹{(total / formData.splitBetween.length).toFixed(2)}
          </Typography>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={true} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center">
            <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
              <MoneyIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                Add New Expense
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Split expenses among group members
              </Typography>
            </Box>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="description"
                label="Expense Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                autoComplete="off"
                autoFocus
                variant="outlined"
                placeholder="e.g., Dinner at Restaurant, Hotel booking"
                helperText="Describe what this expense is for"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="amount"
                label="Amount (₹)"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                step="0.01"
                min="0"
                variant="outlined"
                inputProps={{ min: 0 }}
                helperText="Enter the total amount spent"
              />
            </Grid>
          </Grid>
          
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="paidBy-label">Paid By</InputLabel>
                <Select
                  labelId="paidBy-label"
                  id="paidBy"
                  name="paidBy"
                  value={formData.paidBy}
                  onChange={handleChange}
                  label="Paid By"
                  required
                >
                  {members.map(member => (
                    <MenuItem key={member.userId} value={member.userId}>
                      <Box display="flex" alignItems="center">
                        <Avatar sx={{ width: 24, height: 24, mr: 1, fontSize: '0.75rem' }}>
                          {member.name.charAt(0).toUpperCase()}
                        </Avatar>
                        {member.name}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel id="splitType-label">Split Type</InputLabel>
                <Select
                  labelId="splitType-label"
                  id="splitType"
                  name="splitType"
                  value={formData.splitType}
                  onChange={handleChange}
                  label="Split Type"
                >
                  <MenuItem value="equal">
                    <Box>
                      <Typography variant="body2">Equal Split</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Divide equally among selected members
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="percentage">
                    <Box>
                      <Typography variant="body2">Percentage</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Split by percentage of total
                      </Typography>
                    </Box>
                  </MenuItem>
                  <MenuItem value="exact_amounts">
                    <Box>
                      <Typography variant="body2">Exact Amounts</Typography>
                      <Typography variant="caption" color="text.secondary">
                        Specify exact amount for each person
                      </Typography>
                    </Box>
                  </MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
              Split Between ({formData.splitBetween.length} selected):
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {members.map(member => (
                <Chip
                  key={member.userId}
                  label={member.name}
                  onClick={() => handleSplitMemberChange(member.userId)}
                  color={formData.splitBetween.includes(member.userId) ? 'primary' : 'default'}
                  variant={formData.splitBetween.includes(member.userId) ? 'filled' : 'outlined'}
                  avatar={
                    <Avatar sx={{ width: 24, height: 24, fontSize: '0.75rem' }}>
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                  }
                />
              ))}
            </Box>
          </Box>

          {/* Split Details */}
          {formData.splitBetween.length > 0 && formData.splitType !== 'equal' && (
            <Box mt={3}>
              <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 'bold' }}>
                {formData.splitType === 'percentage' ? 'Split Percentages:' : 'Split Amounts:'}
              </Typography>
              <Grid container spacing={2}>
                {formData.splitBetween.map(memberId => {
                  const member = members.find(m => m && m.userId === memberId);
                  return (
                    <Grid item xs={12} sm={6} key={memberId}>
                      <TextField
                        fullWidth
                        size="small"
                        label={member?.name}
                        type="number"
                        value={formData.splitType === 'percentage' ? splitPercentages[memberId] || '' : splitAmounts[memberId] || ''}
                        onChange={(e) => {
                          if (formData.splitType === 'percentage') {
                            handleSplitPercentageChange(memberId, e.target.value);
                          } else {
                            handleSplitAmountChange(memberId, e.target.value);
                          }
                        }}
                        inputProps={{ 
                          min: 0, 
                          step: formData.splitType === 'percentage' ? '0.01' : '0.01',
                          max: formData.splitType === 'percentage' ? 100 : undefined
                        }}
                        InputProps={{
                          endAdornment: formData.splitType === 'percentage' ? '%' : '₹'
                        }}
                      />
                    </Grid>
                  );
                })}
              </Grid>
            </Box>
          )}

          {getSplitPreview()}

          {message && (
            <Alert 
              severity={messageType === 'success' ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} color="inherit" size="large">
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
          size="large"
        >
          {loading ? 'Adding Expense...' : 'Add Expense'}
        </Button>
      </DialogActions>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Dialog>
  );
};

export default AddExpenseModal;