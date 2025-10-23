import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from "../config/api";import AddExpenseModal from '../components/AddExpenseModal';
import EditExpenseModal from '../components/EditExpenseModal';
import SmartSummaries from '../components/SmartSummaries';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
} from '@mui/material';
import {
  Group as GroupIcon,
  Add as AddIcon,
  AccountBalance as BalanceIcon,
  Person as PersonIcon,
  AttachMoney as MoneyIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  SmartToy as SmartToyIcon,
} from '@mui/icons-material';

const GroupDetails = () => {
  const { groupId } = useParams();
  const [group, setGroup] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState(null);
  const [showSmartSummaries, setShowSmartSummaries] = useState(false);
  const [users, setUsers] = useState([]);

  useEffect(() => {
    fetchGroupDetails();
  }, [groupId]);

  const fetchGroupDetails = async () => {
    try {
      const [groupResponse, usersResponse] = await Promise.all([
        axios.get(`/api/groups/${groupId}`),
        axios.get(`${API_BASE_URL}/api/users')
      ]);
      
      const group = groupResponse.data.data || groupResponse.data;
      const users = usersResponse.data.data || usersResponse.data;
      
      setGroup(group || null);
      setUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Error fetching group details:', error);
      setError('Failed to load group details');
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    if (!userId || !Array.isArray(users)) return userId;
    const user = users.find(u => u && u.userId === userId);
    return user ? user.name : userId;
  };

  const handleExpenseAdded = () => {
    fetchGroupDetails();
    setShowAddExpense(false);
  };

  const handleEditExpense = (expense) => {
    setEditingExpense(expense);
    setShowEditExpense(true);
  };

  const handleExpenseUpdated = () => {
    fetchGroupDetails();
    setShowEditExpense(false);
    setEditingExpense(null);
  };

  const handleDeleteExpense = (expense) => {
    setDeletingExpense(expense);
    setShowDeleteDialog(true);
  };

  const confirmDeleteExpense = async () => {
    if (!deletingExpense) return;

    try {
      await axios.delete(`/api/groups/${groupId}/expenses/${deletingExpense.expenseId}`);
      fetchGroupDetails();
      setShowDeleteDialog(false);
      setDeletingExpense(null);
    } catch (error) {
      console.error('Error deleting expense:', error);
      setError('Failed to delete expense');
    }
  };

  const cancelDeleteExpense = () => {
    setShowDeleteDialog(false);
    setDeletingExpense(null);
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress size={60} />
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  if (!group) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Alert severity="warning">Group not found</Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Group Header */}
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'secondary.main', mr: 2, width: 56, height: 56 }}>
            <GroupIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              {group.name}
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Group ID: {group.groupId}
            </Typography>
          </Box>
        </Box>
        
        <Box display="flex" gap={2} flexWrap="wrap">
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setShowAddExpense(true)}
            size="large"
          >
            Add Expense
          </Button>
          <Button
            variant="outlined"
            startIcon={<SmartToyIcon />}
            onClick={() => setShowSmartSummaries(true)}
            size="large"
            color="secondary"
          >
            Smart Summaries
          </Button>
          <Button
            component={Link}
            to={`/group/${groupId}/balances`}
            variant="outlined"
            startIcon={<BalanceIcon />}
            size="large"
          >
            View Balances
          </Button>
        </Box>
      </Paper>

      {/* Members Section */}
      <Card elevation={2} sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            <PersonIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Group Members ({group.members.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <List>
            {group.members.map((member, index) => (
              <React.Fragment key={member.userId}>
                <ListItem>
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: 'primary.main' }}>
                      {member.name.charAt(0).toUpperCase()}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={member.name}
                    secondary={member.email}
                  />
                </ListItem>
                {index < group.members.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Expenses Section */}
      <Card elevation={2}>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            <MoneyIcon sx={{ mr: 1, verticalAlign: 'middle' }} />
            Recent Expenses ({group.expenses.length})
          </Typography>
          <Divider sx={{ mb: 2 }} />
          
          {group.expenses.length === 0 ? (
            <Box textAlign="center" py={4}>
              <MoneyIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                No expenses yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                Add your first expense to get started!
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowAddExpense(true)}
              >
                Add First Expense
              </Button>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Description</strong></TableCell>
                    <TableCell align="right"><strong>Amount</strong></TableCell>
                    <TableCell><strong>Paid By</strong></TableCell>
                    <TableCell><strong>Split Between</strong></TableCell>
                    <TableCell><strong>Date</strong></TableCell>
                    <TableCell align="center"><strong>Actions</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {group.expenses.map(expense => (
                    <TableRow key={expense.expenseId} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center">
                          <Typography variant="body1">
                            {expense.description}
                          </Typography>
                          {expense.category && expense.category !== 'other' && (
                            <Chip
                              label={expense.category}
                              size="small"
                              color="secondary"
                              sx={{ ml: 1 }}
                            />
                          )}
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body1" fontWeight="bold">
                          ₹{expense.amount.toFixed(2)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={getUserName(expense.paidBy)}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Box display="flex" flexWrap="wrap" gap={0.5}>
                          {expense.splitBetween.map(memberId => (
                            <Chip
                              key={memberId}
                              label={getUserName(memberId)}
                              size="small"
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(expense.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box display="flex" justifyContent="center" gap={1}>
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleEditExpense(expense)}
                            title="Edit expense"
                          >
                            <EditIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() => handleDeleteExpense(expense)}
                            title="Delete expense"
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {showAddExpense && (
        <AddExpenseModal
          groupId={groupId}
          members={group.members}
          onClose={() => setShowAddExpense(false)}
          onExpenseAdded={handleExpenseAdded}
        />
      )}

      {showEditExpense && editingExpense && (
        <EditExpenseModal
          groupId={groupId}
          expenseId={editingExpense.expenseId}
          expense={editingExpense}
          members={group.members}
          onClose={() => {
            setShowEditExpense(false);
            setEditingExpense(null);
          }}
          onExpenseUpdated={handleExpenseUpdated}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteDialog}
        onClose={cancelDeleteExpense}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
      >
        <DialogTitle id="delete-dialog-title">
          Delete Expense
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete the expense "{deletingExpense?.description}"? 
            This action cannot be undone and will affect the group's balance calculations.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={cancelDeleteExpense} color="primary">
            Cancel
          </Button>
          <Button onClick={confirmDeleteExpense} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Smart Summaries Modal */}
      {showSmartSummaries && (
        <SmartSummaries
          groupId={groupId}
          groupName={group.name}
          onClose={() => setShowSmartSummaries(false)}
        />
      )}
    </Container>
  );
};

export default GroupDetails;
