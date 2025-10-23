import React, { useState } from 'react';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Avatar,
} from '@mui/material';
import { PersonAdd as PersonAddIcon } from '@mui/icons-material';

const CreateUser = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    setMessageType('');

    try {
      const response = await axios.post(API_BASE_URL + '/api/users', formData);
      setMessage(`User created successfully! User ID: ${response.data.data?.userId || response.data.userId}`);
      setMessageType('success');
      setFormData({ name: '', email: '' });
    } catch (error) {
      setMessage(error.response?.data?.error || 'Error creating user');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={1} sx={{ p: 4 }}>
        <Box display="flex" alignItems="center" mb={3}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2 }}>
            <PersonAddIcon />
          </Avatar>
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            Create New User
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="name"
            label="Full Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            autoComplete="name"
            autoFocus
            variant="outlined"
            sx={{ mb: 2 }}
          />
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            autoComplete="email"
            variant="outlined"
            sx={{ mb: 3 }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{ py: 1.5 }}
            startIcon={loading ? <CircularProgress size={20} /> : <PersonAddIcon />}
          >
            {loading ? 'Creating User...' : 'Create User'}
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

export default CreateUser;
