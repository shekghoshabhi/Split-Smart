import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  Container,
} from '@mui/material';
import {
  Home as HomeIcon,
  PersonAdd as PersonAddIcon,
  GroupAdd as GroupAddIcon,
} from '@mui/icons-material';

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/', label: 'Home', icon: <HomeIcon /> },
    { path: '/create-user', label: 'Create User', icon: <PersonAddIcon /> },
    { path: '/create-group', label: 'Create Group', icon: <GroupAddIcon /> },
  ];

  return (
    <AppBar 
      position="static" 
      elevation={0}
      sx={{ 
        backgroundColor: 'white',
        borderBottom: '1px solid #E5E7EB',
        color: 'text.primary'
      }}
    >
      <Container maxWidth="lg">
        <Toolbar sx={{ py: 1 }}>
          <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
            <Box
              sx={{
                width: 40,
                height: 40,
                backgroundColor: 'primary.main',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                mr: 2,
              }}
            >
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold' }}>
                ₹
              </Typography>
            </Box>
            <Typography
              variant="h5"
              component="div"
              sx={{ 
                fontWeight: 'bold',
                color: 'primary.main',
                mr: 4
              }}
            >
              Split Smart
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                component={Link}
                to={item.path}
                startIcon={item.icon}
                color="inherit"
                variant={location.pathname === item.path ? 'contained' : 'text'}
                sx={{
                  backgroundColor: location.pathname === item.path ? 'primary.main' : 'transparent',
                  color: location.pathname === item.path ? 'white' : 'text.secondary',
                  borderRadius: 2,
                  px: 2,
                  py: 1,
                  '&:hover': {
                    backgroundColor: location.pathname === item.path ? 'primary.dark' : 'grey.100',
                  },
                }}
              >
                {item.label}
              </Button>
            ))}
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Navbar;
