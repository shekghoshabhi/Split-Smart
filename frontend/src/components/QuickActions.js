import React from 'react';
import { Link } from 'react-router-dom';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Grid,
  Box,
} from '@mui/material';
import {
  Person as PersonIcon,
  Group as GroupIcon,
  AttachMoney as MoneyIcon,
  Add as AddIcon,
} from '@mui/icons-material';
import ActionButton from './ActionButton';

const QuickActions = ({ 
  users = [], 
  groups = [], 
  onCreateUser, 
  onCreateGroup,
  onCreateExpense
}) => {
  const actions = [
    {
      id: 'create-user',
      title: 'Create User',
      description: 'Add new users to your expense splitting groups',
      icon: <PersonIcon />,
      count: users.length,
      action: onCreateUser,
      color: 'primary',
      link: '/create-user'
    },
    {
      id: 'create-group',
      title: 'Create Group',
      description: 'Create a new group to start splitting expenses',
      icon: <GroupIcon />,
      count: groups.length,
      action: onCreateGroup,
      color: 'secondary',
      link: '/create-group'
    },
    {
      id: 'add-expense',
      title: 'Add Expense',
      description: 'Add expenses to existing groups',
      icon: <MoneyIcon />,
      count: null,
      action: onCreateExpense,
      color: 'success',
      link: null
    }
  ];

  return (
    <Box display="flex" justifyContent="center">
      <Grid container spacing={4} sx={{ maxWidth: 'fit-content' }}>
        {actions.map((action) => (
          <Grid item xs={12} sm={6} md={4} key={action.id}>
            <Card 
              elevation={1} 
              sx={{ 
                width: 280,
                height: 320,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  elevation: 3,
                  transform: 'translateY(-2px)'
                }
              }}
            >
              <CardContent sx={{ 
                p: 4, 
                textAlign: 'center',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between'
              }}>
                <Box>
                  <Avatar 
                    sx={{ 
                      bgcolor: `${action.color}.main`, 
                      width: 64, 
                      height: 64, 
                      mx: 'auto', 
                      mb: 3 
                    }}
                  >
                    {action.icon}
                  </Avatar>
                  
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {action.title}
                    {action.count !== null && (
                      <Typography 
                        component="span" 
                        variant="body2" 
                        color="text.secondary"
                        sx={{ ml: 1 }}
                      >
                        ({action.count})
                      </Typography>
                    )}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                    {action.description}
                  </Typography>
                </Box>
                
                <ActionButton
                  variant="contained"
                  fullWidth
                  color={action.color}
                  startIcon={<AddIcon />}
                  onClick={action.action}
                  component={action.link ? Link : 'button'}
                  to={action.link}
                >
                  {action.title}
                </ActionButton>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default QuickActions;
