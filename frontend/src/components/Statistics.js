import React from 'react';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  Avatar,
  Chip,
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  CheckCircle as CheckIcon,
  Warning as WarningIcon,
} from '@mui/icons-material';

const Statistics = ({ 
  users = [], 
  groups = [], 
  totalExpenses = 0, 
  expenseCount = 0,
  outstandingBalances = 0 
}) => {
  const stats = [
    {
      id: 'users',
      title: 'Total Users',
      value: users.length,
      icon: <PersonIcon />,
      color: 'primary',
      description: 'Registered users'
    },
    {
      id: 'groups',
      title: 'Active Groups',
      value: groups.length,
      icon: <GroupIcon />,
      color: 'secondary',
      description: 'Expense groups'
    },
    {
      id: 'expenses',
      title: 'Total Expenses',
      value: `₹${totalExpenses.toFixed(2)}`,
      icon: <MoneyIcon />,
      color: 'success',
      description: `${expenseCount} transactions`
    },
    {
      id: 'balances',
      title: 'Outstanding',
      value: `₹${outstandingBalances.toFixed(2)}`,
      icon: outstandingBalances > 0 ? <WarningIcon /> : <CheckIcon />,
      color: outstandingBalances > 0 ? 'warning' : 'success',
      description: outstandingBalances > 0 ? 'Unsettled amounts' : 'All settled'
    }
  ];

  return (
    <Box display="flex" justifyContent="center">
      <Grid container spacing={3} sx={{ maxWidth: 'fit-content' }}>
        {stats.map((stat) => (
          <Grid item xs={12} sm={6} md={3} key={stat.id}>
            <Card elevation={1}>
              <CardContent sx={{ p: 3 }}>
                <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
                  <Avatar sx={{ bgcolor: `${stat.color}.main` }}>
                    {stat.icon}
                  </Avatar>
                  <Chip 
                    label={stat.description} 
                    size="small" 
                    color={stat.color}
                    variant="outlined"
                  />
                </Box>
                
                <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stat.value}
                </Typography>
                
                <Typography variant="body2" color="text.secondary">
                  {stat.title}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Statistics;
