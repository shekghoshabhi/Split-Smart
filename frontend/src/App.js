import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import CreateUser from './pages/CreateUser';
import CreateGroup from './pages/CreateGroup';
import GroupDetails from './pages/GroupDetails';
import Balances from './pages/Balances';

const theme = createTheme({
  palette: {
    primary: {
      main: '#10B981', // Green primary
      light: '#34D399',
      dark: '#059669',
    },
    secondary: {
      main: '#6B7280',
    },
    background: {
      default: '#F9FAFB',
    },
    success: {
      main: '#10B981',
    },
  },
  typography: {
    fontFamily: '"Inter", "SF Pro Display", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      fontSize: '2.5rem',
      lineHeight: 1.2,
    },
    h2: {
      fontWeight: 700,
      fontSize: '2rem',
      lineHeight: 1.3,
    },
    h3: {
      fontWeight: 700,
      fontSize: '1.75rem',
      lineHeight: 1.3,
    },
    h4: {
      fontWeight: 600,
      fontSize: '1.5rem',
      lineHeight: 1.4,
    },
    h5: {
      fontWeight: 600,
      fontSize: '1.25rem',
      lineHeight: 1.4,
    },
    h6: {
      fontWeight: 600,
      fontSize: '1.125rem',
      lineHeight: 1.4,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.5,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
    },
  },
  shape: {
    borderRadius: 16,
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '12px 24px',
        },
        sizeSmall: {
          padding: '8px 16px',
          fontSize: '0.875rem',
        },
        sizeLarge: {
          padding: '16px 32px',
          fontSize: '1rem',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
          borderRadius: 16,
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 12,
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          borderRadius: 16,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <div className="App">
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/create-user" element={<CreateUser />} />
            <Route path="/create-group" element={<CreateGroup />} />
            <Route path="/group/:groupId" element={<GroupDetails />} />
            <Route path="/group/:groupId/balances" element={<Balances />} />
          </Routes>
        </div>
      </Router>
    </ThemeProvider>
  );
}

export default App;
