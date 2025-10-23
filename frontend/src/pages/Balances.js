import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import API_BASE_URL from '../config/api';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  CircularProgress,
  Chip,
  Avatar,
} from '@mui/material';
import {
  AccountBalance as BalanceIcon,
  CheckCircle as CheckIcon,
  Person as PersonIcon,
} from '@mui/icons-material';

const Balances = () => {
  const { groupId } = useParams();
  const [balances, setBalances] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settling, setSettling] = useState({});

  useEffect(() => {
    fetchData();
  }, [groupId]);

  const fetchData = async () => {
    try {
      const [balancesResponse, usersResponse] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/groups/${groupId}/balances`),
        axios.get(`${API_BASE_URL}/api/users')
      ]);
      
      const balances = balancesResponse.data.data?.balances || balancesResponse.data.balances || [];
      const users = usersResponse.data.data || usersResponse.data || [];
      
      setBalances(Array.isArray(balances) ? balances : []);
      setUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    if (!userId || !Array.isArray(users)) return userId;
    const user = users.find(u => u && u.userId === userId);
    return user ? user.name : userId;
  };

  const handleSettle = async (from, to, amount) => {
    const key = `${from}-${to}`;
    setSettling(prev => ({ ...prev, [key]: true }));

    try {
      await axios.post(`${API_BASE_URL}/api/groups/${groupId}/settle`, {
        from,
        to,
        amount
      });
      fetchData(); // Refresh balances after settlement
    } catch (error) {
      console.error('Error settling balance:', error);
      alert('Error settling balance');
    } finally {
      setSettling(prev => ({ ...prev, [key]: false }));
    }
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

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ bgcolor: 'primary.main', mr: 2, width: 56, height: 56 }}>
            <BalanceIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Group Balances
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Track and settle outstanding debts
            </Typography>
          </Box>
        </Box>
      </Paper>

      <Card elevation={2}>
        <CardContent>
          {balances.length === 0 ? (
            <Box textAlign="center" py={6}>
              <CheckIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
              <Typography variant="h5" gutterBottom color="success.main">
                All Balances Settled!
              </Typography>
              <Typography variant="body1" color="text.secondary" paragraph>
                No outstanding debts. Everyone is square! 🎉
              </Typography>
            </Box>
          ) : (
            <>
              <Typography variant="h5" component="h2" gutterBottom>
                Outstanding Balances ({balances.length})
              </Typography>
              <TableContainer component={Paper} variant="outlined">
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell><strong>From</strong></TableCell>
                      <TableCell><strong>To</strong></TableCell>
                      <TableCell align="right"><strong>Amount</strong></TableCell>
                      <TableCell align="center"><strong>Action</strong></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {balances.map((balance, index) => {
                      const key = `${balance.from}-${balance.to}`;
                      return (
                        <TableRow key={index} hover>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: 'error.main', mr: 1, width: 32, height: 32 }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Chip
                                label={getUserName(balance.from)}
                                size="small"
                                color="error"
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Box display="flex" alignItems="center">
                              <Avatar sx={{ bgcolor: 'success.main', mr: 1, width: 32, height: 32 }}>
                                <PersonIcon sx={{ fontSize: 16 }} />
                              </Avatar>
                              <Chip
                                label={getUserName(balance.to)}
                                size="small"
                                color="success"
                                variant="outlined"
                              />
                            </Box>
                          </TableCell>
                          <TableCell align="right">
                            <Typography variant="h6" color="error" fontWeight="bold">
                              ₹{balance.amount.toFixed(4)}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Button
                              variant="contained"
                              color="success"
                              size="small"
                              onClick={() => handleSettle(balance.from, balance.to, balance.amount)}
                              disabled={settling[key]}
                              startIcon={settling[key] ? <CircularProgress size={16} /> : <CheckIcon />}
                            >
                              {settling[key] ? 'Settling...' : 'Settle'}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </>
          )}
        </CardContent>
      </Card>
    </Container>
  );
};

export default Balances;
