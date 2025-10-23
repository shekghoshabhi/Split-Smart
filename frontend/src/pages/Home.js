import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Button,
  Box,
  Chip,
  Avatar,
  Divider,
  TextField,
  InputAdornment,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  Snackbar,
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  Add as AddIcon,
  Close as CloseIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  AccountBalance as BalanceIcon,
} from '@mui/icons-material';
import QuickActions from '../components/QuickActions';
import Statistics from '../components/Statistics';
import Section from '../components/Section';
import CustomCard from '../components/CustomCard';
import ActionButton from '../components/ActionButton';

const Home = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newParticipant, setNewParticipant] = useState('');
  const [participants, setParticipants] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [expenseCount, setExpenseCount] = useState(0);
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [showCreateUser, setShowCreateUser] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [usersResponse, groupsResponse] = await Promise.all([
        axios.get('/api/users'),
        axios.get('/api/groups')
      ]);
      
      const users = usersResponse.data.data || usersResponse.data || [];
      const groups = groupsResponse.data.data || groupsResponse.data || [];
      
      setUsers(Array.isArray(users) ? users : []);
      setGroups(Array.isArray(groups) ? groups : []);
      
      // Calculate total expenses across all groups
      let total = 0;
      let count = 0;
      
      // Fetch expenses for each group
      const expensePromises = groups.map(async (group) => {
        try {
          const expensesResponse = await axios.get(`/api/groups/${group.groupId}/expenses`);
          return expensesResponse.data.data || expensesResponse.data;
        } catch (error) {
          console.error(`Error fetching expenses for group ${group.groupId}:`, error);
          return [];
        }
      });
      
      const allExpenses = await Promise.all(expensePromises);
      
      // Calculate totals
      allExpenses.forEach(expenses => {
        expenses.forEach(expense => {
          total += expense.amount;
          count++;
        });
      });
      
      console.log('Total expenses calculated:', total, 'Count:', count);
      console.log('All expenses:', allExpenses);
      
      setTotalExpenses(total);
      setExpenseCount(count);
    } catch (error) {
      console.error('Error fetching data:', error);
      showSnackbar('Error loading data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const addParticipant = () => {
    if (newParticipant.trim() && !participants.includes(newParticipant.trim())) {
      setParticipants([...participants, newParticipant.trim()]);
      setNewParticipant('');
      showSnackbar(`${newParticipant.trim()} added to participants`);
    }
  };

  const removeParticipant = (participant) => {
    setParticipants(participants.filter(p => p !== participant));
    showSnackbar(`${participant} removed from participants`);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      addParticipant();
    }
  };

  const createGroupFromParticipants = () => {
    if (participants.length < 2) {
      showSnackbar('Please add at least 2 participants to create a group', 'error');
      return;
    }
    setShowCreateGroup(true);
  };

  const handleCreateGroup = async (groupData) => {
    try {
      await axios.post('/api/groups', groupData);
      showSnackbar(`Group "${groupData.name}" created successfully!`);
      setShowCreateGroup(false);
      setParticipants([]);
      await fetchData(); // Wait for data refresh
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error creating group', 'error');
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await axios.post('/api/users', userData);
      showSnackbar(`User "${userData.name}" created successfully!`);
      setShowCreateUser(false);
      await fetchData(); // Wait for data refresh
    } catch (error) {
      showSnackbar(error.response?.data?.error || 'Error creating user', 'error');
    }
  };

  // Add a manual refresh function
  const refreshData = async () => {
    setLoading(true);
    await fetchData();
  };

  const getSettlementStatus = () => {
    // Check if all groups have zero balances
    const hasOutstandingBalances = groups.some(group => {
      // This would need to be calculated from actual balances
      return false; // For now, assume all settled
    });
    return !hasOutstandingBalances;
  };

  if (loading) {
    return (
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" align="center">Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      {/* Hero Section */}
      <Section spacing={8}>
        <Box textAlign="center">
          <Box
            sx={{
              width: 96,
              height: 96,
              backgroundColor: 'primary.main',
              borderRadius: 4,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
              boxShadow: '0 8px 32px rgba(16, 185, 129, 0.3)',
            }}
          >
            <Typography variant="h2" sx={{ color: 'white', fontWeight: 'bold' }}>
              $
            </Typography>
          </Box>
          <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 2 }}>
            Split Smart
          </Typography>
          <Typography variant="h5" color="text.secondary" sx={{ maxWidth: 600, mx: 'auto', mb: 4, fontWeight: 400 }}>
            Easy expense splitting with friends & family
          </Typography>
          <ActionButton
            variant="outlined"
            onClick={refreshData}
            loading={loading}
            size="large"
          >
            Refresh Data
          </ActionButton>
        </Box>
      </Section>

      <Grid container spacing={5}>
        {/* Participants Section */}
        <Grid item xs={12} md={6}>
          <CustomCard hover sx={{ height: '100%' }}>
            <Box display="flex" alignItems="center" justifyContent="space-between" mb={4}>
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ color: 'primary.main', mr: 2, fontSize: 28 }} />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  Participants ({participants.length})
                </Typography>
              </Box>
              {participants.length >= 2 && (
                <ActionButton
                  variant="contained"
                  size="small"
                  onClick={createGroupFromParticipants}
                  startIcon={<GroupIcon />}
                >
                  Create Group
                </ActionButton>
              )}
            </Box>
            
            <Box display="flex" gap={2} mb={4}>
              <TextField
                fullWidth
                placeholder="Enter name"
                value={newParticipant}
                onChange={(e) => setNewParticipant(e.target.value)}
                onKeyPress={handleKeyPress}
                size="small"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={addParticipant} color="primary">
                        <AddIcon />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />
            </Box>

            {participants.length > 0 ? (
              <Box display="flex" flexWrap="wrap" gap={1.5}>
                {participants.map((participant, index) => (
                  <Chip
                    key={index}
                    label={participant}
                    onDelete={() => removeParticipant(participant)}
                    deleteIcon={<CloseIcon />}
                    color="primary"
                    variant="outlined"
                    sx={{ 
                      backgroundColor: 'primary.light', 
                      color: 'white',
                      fontWeight: 500,
                      '& .MuiChip-deleteIcon': {
                        color: 'white'
                      }
                    }}
                  />
                ))}
              </Box>
            ) : (
              <Box textAlign="center" py={3}>
                <Typography variant="body2" color="text.secondary">
                  Add participants to get started
                </Typography>
              </Box>
            )}
          </CustomCard>
        </Grid>

        {/* Total Expenses Section */}
        <Grid item xs={12} md={6}>
          <CustomCard 
            hover
            sx={{ 
              height: '100%',
              background: 'linear-gradient(135deg, #10B981 0%, #34D399 100%)',
              color: 'white'
            }}
          >
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
              Total Expenses
            </Typography>
            <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 2 }}>
              ₹{totalExpenses.toFixed(2)}
            </Typography>
            <Typography variant="body1" sx={{ opacity: 0.9, mb: 3 }}>
              {expenseCount} expenses across {groups.length} groups
            </Typography>
            {groups.length > 0 && (
              <ActionButton
                variant="outlined"
                sx={{ 
                  color: 'white', 
                  borderColor: 'white',
                  '&:hover': { 
                    borderColor: 'white', 
                    backgroundColor: 'rgba(255,255,255,0.1)' 
                  }
                }}
                onClick={() => navigate('/')}
              >
                View All Groups
              </ActionButton>
            )}
          </CustomCard>
        </Grid>
      </Grid>

      {/* Settlement Status */}
      <Section spacing={6}>
        <CustomCard sx={{ mt: 4 }}>
          <Box textAlign="center" sx={{ py: 2 }}>
            <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
              <CheckIcon sx={{ color: 'success.main', mr: 2, fontSize: 28 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {getSettlementStatus() ? 'All settled up! 🎉' : 'Outstanding balances exist'}
              </Typography>
            </Box>
            {!getSettlementStatus() && (
              <ActionButton
                variant="contained"
                color="warning"
                startIcon={<BalanceIcon />}
                onClick={() => navigate('/')}
              >
                View Balances
              </ActionButton>
            )}
          </Box>
        </CustomCard>
      </Section>

      {/* Recent Groups Section */}
      <Section 
        title="Recent Groups" 
        subtitle={`${groups.length} groups created`}
        spacing={6}
      >
        <CustomCard>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={5} sx={{ px: 1 }}>
            <Box display="flex" alignItems="center">
              <GroupIcon sx={{ color: 'primary.main', mr: 3, fontSize: 32 }} />
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                Your Groups
              </Typography>
            </Box>
            <Box display="flex" gap={3}>
              <ActionButton
                variant="outlined"
                startIcon={<PersonIcon />}
                onClick={() => setShowCreateUser(true)}
                size="small"
              >
                Add User
              </ActionButton>
              <ActionButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateGroup(true)}
                size="small"
              >
                Create Group
              </ActionButton>
            </Box>
          </Box>

          {groups.length === 0 ? (
            <Box 
              textAlign="center" 
              py={8}
              sx={{ 
                border: '2px dashed #E5E7EB',
                borderRadius: 3,
                backgroundColor: '#FAFAFA'
              }}
            >
              <MoneyIcon sx={{ fontSize: 80, color: 'text.secondary', mb: 3 }} />
              <Typography variant="h5" gutterBottom color="text.secondary" sx={{ fontWeight: 'bold' }}>
                No groups yet
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph sx={{ mb: 4 }}>
                Create your first group to start splitting expenses!
              </Typography>
              <ActionButton
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setShowCreateGroup(true)}
                size="large"
              >
                Create First Group
              </ActionButton>
            </Box>
          ) : (
            <Box sx={{ px: 3 }}>
              {groups.slice(0, 5).map((group, index) => (
                <React.Fragment key={group.groupId}>
                  <Box display="flex" justifyContent="space-between" alignItems="center" py={4}>
                    <Box display="flex" alignItems="center">
                      <Avatar sx={{ bgcolor: 'primary.main', mr: 4, width: 56, height: 56 }}>
                        <GroupIcon sx={{ fontSize: 28 }} />
                      </Avatar>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                          {group.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {group.members.length} members • Created {new Date(group.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Box>
                    <Box display="flex" gap={3}>
                      <ActionButton
                        component={Link}
                        to={`/group/${group.groupId}/balances`}
                        variant="outlined"
                        size="small"
                        startIcon={<BalanceIcon />}
                      >
                        Balances
                      </ActionButton>
                      <ActionButton
                        component={Link}
                        to={`/group/${group.groupId}`}
                        variant="contained"
                        size="small"
                      >
                        View Details
                      </ActionButton>
                    </Box>
                  </Box>
                  {index < groups.slice(0, 5).length - 1 && <Divider sx={{ mx: 3 }} />}
                </React.Fragment>
              ))}
              {groups.length > 5 && (
                <Box textAlign="center" mt={6}>
                  <ActionButton variant="text" onClick={() => navigate('/')}>
                    View All Groups ({groups.length})
                  </ActionButton>
                </Box>
              )}
            </Box>
          )}
        </CustomCard>
      </Section>

      {/* Statistics Section */}
      <Section 
        title="Overview Statistics" 
        subtitle="Track your expense splitting activity"
        spacing={6}
      >
        <Statistics 
          users={users}
          groups={groups}
          totalExpenses={totalExpenses}
          expenseCount={expenseCount}
          outstandingBalances={0}
        />
      </Section>

      {/* Quick Actions Section */}
      <Section 
        title="Quick Actions" 
        subtitle="Manage your expense splitting workflow"
        spacing={6}
      >
        <QuickActions 
          users={users}
          groups={groups}
          onCreateUser={() => setShowCreateUser(true)}
          onCreateGroup={() => setShowCreateGroup(true)}
          onCreateExpense={() => {
            if (groups.length === 0) {
              showSnackbar('Please create a group first', 'error');
            } else {
              navigate('/create-group');
            }
          }}
        />
      </Section>

      {/* Modals */}
      <CreateUserModal 
        open={showCreateUser} 
        onClose={() => setShowCreateUser(false)} 
        onSubmit={handleCreateUser}
      />
      
      <CreateGroupModal 
        open={showCreateGroup} 
        onClose={() => setShowCreateGroup(false)} 
        onSubmit={handleCreateGroup}
        users={users}
        participants={participants}
      />

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
    </Container>
  );
};

// Create User Modal Component
const CreateUserModal = ({ open, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({ name: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', email: '' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create New User</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Full Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            label="Email Address"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create User'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

// Create Group Modal Component
const CreateGroupModal = ({ open, onClose, onSubmit, users, participants }) => {
  const [formData, setFormData] = useState({ 
    name: '', 
    members: participants.length > 0 ? participants.map(p => users.find(u => u.name === p)?.userId || p) : [] 
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.members.length < 2) {
      alert('Please select at least 2 members');
      return;
    }
    setLoading(true);
    try {
      await onSubmit(formData);
      setFormData({ name: '', members: [] });
    } finally {
      setLoading(false);
    }
  };

  const handleMemberChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Create New Group</DialogTitle>
      <DialogContent>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Group Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            autoFocus
            placeholder="e.g., Trip to Goa, Office Lunch Group"
          />
          
          <Box mt={3}>
            <Typography variant="subtitle1" gutterBottom>
              Select Members:
            </Typography>
            <Box display="flex" flexWrap="wrap" gap={1}>
              {users.map(user => (
                <Chip
                  key={user.userId}
                  label={user.name}
                  onClick={() => handleMemberChange(user.userId)}
                  color={formData.members.includes(user.userId) ? 'primary' : 'default'}
                  variant={formData.members.includes(user.userId) ? 'filled' : 'outlined'}
                />
              ))}
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button 
          onClick={handleSubmit} 
          variant="contained" 
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Group'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default Home;