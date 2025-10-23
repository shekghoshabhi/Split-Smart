import React, { useState, useEffect } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar,
  FormControl,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Chip,
} from '@mui/material';
import { GroupAdd as GroupAddIcon, Person as PersonIcon } from '@mui/icons-material';

const CreateGroup = () => {
  const [formData, setFormData] = useState({
    name: '',
    members: []
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(API_BASE_URL + '/api/users');
      const users = response.data.data || response.data || [];
      setUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleMemberChange = (userId) => {
    setFormData(prev => ({
      ...prev,
      members: prev.members.includes(userId)
        ? prev.members.filter(id => id !== userId)
        : [...prev.members, userId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.members.length === 0) {
      setMessage('Please select at least one member');
      setMessageType('error');
      return;
    }
    
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const groupData = {
        ...formData,
        createdBy: formData.members[0] || 'unknown'
      };
      const response = await axios.post(API_BASE_URL + '/api/groups', groupData);
      setMessage(`Group created successfully! Group ID: ${response.data.data?.groupId || response.data.groupId}`);
      setMessageType('success');
      setFormData({ name: '', members: [] });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error creating group');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: 'secondary.main', mr: 2 }}>
            <GroupAddIcon />
          </Avatar>
          <Typography variant="h4" component="h1">
            Create New Group
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Group Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="off"
            autoFocus
            variant="outlined"
            placeholder="e.g., Trip to Goa, Office Lunch Group"
          />

          <FormControl component="fieldset" sx={{ mt: 3, width: '100%' }}>
            <FormLabel component="legend" sx={{ mb: 2 }}>
              <Box display="flex" alignItems="center">
                <PersonIcon sx={{ mr: 1 }} />
                Select Members
              </Box>
            </FormLabel>
            <FormGroup>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {users.map(user => (
                  <FormControlLabel
                    key={user.userId}
                    control={
                      <Checkbox
                        checked={formData.members.includes(user.userId)}
                        onChange={() => handleMemberChange(user.userId)}
                        color="primary"
                      />
                    }
                    label={
                      <Box display="flex" alignItems="center">
                        <Chip
                          label={user.name}
                          variant="outlined"
                          size="small"
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {user.email}
                        </Typography>
                      </Box>
                    }
                  />
                ))}
              </Box>
            </FormGroup>
          </FormControl>

          {formData.members.length > 0 && (
            <Box mt={2}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Selected Members ({formData.members.length}):
              </Typography>
              <Box display="flex" flexWrap="wrap" gap={1}>
                {formData.members.map(memberId => {
                  const user = users.find(u => u.userId === memberId);
                  return (
                    <Chip
                      key={memberId}
                      label={user?.name || memberId}
                      color="primary"
                      size="small"
                    />
                  );
                })}
              </Box>
            </Box>
          )}
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ mt: 3, mb: 2, py: 1.5 }}
            startIcon={loading ? <CircularProgress size={20} /> : <GroupAddIcon />}
          >
            {loading ? 'Creating Group...' : 'Create Group'}
          </Button>

          {message && (
            <Alert 
              severity={messageType === 'success' ? 'success' : 'error'} 
              sx={{ mt: 2 }}
            >
              {message}
            </Alert>
          )}
        </Box>
      </Paper>
    </Container>
  );
};

export default CreateGroup;
