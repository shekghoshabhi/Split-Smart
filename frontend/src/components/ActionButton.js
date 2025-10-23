import React from 'react';
import { Button, CircularProgress } from '@mui/material';

const ActionButton = ({
  children,
  loading = false,
  variant = 'contained',
  size = 'medium',
  fullWidth = false,
  startIcon,
  endIcon,
  color = 'primary',
  disabled = false,
  onClick,
  sx = {},
  ...props
}) => {
  return (
    <Button
      variant={variant}
      size={size}
      fullWidth={fullWidth}
      startIcon={loading ? <CircularProgress size={20} /> : startIcon}
      endIcon={endIcon}
      color={color}
      disabled={disabled || loading}
      onClick={onClick}
      sx={{
        borderRadius: 2,
        fontWeight: 600,
        textTransform: 'none',
        ...sx
      }}
      {...props}
    >
      {loading ? 'Loading...' : children}
    </Button>
  );
};

export default ActionButton;
