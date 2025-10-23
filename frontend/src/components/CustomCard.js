import React from 'react';
import { Card, CardContent } from '@mui/material';

const CustomCard = ({ 
  children, 
  padding = 3, 
  elevation = 1,
  hover = false,
  sx = {} 
}) => {
  return (
    <Card 
      elevation={elevation}
      sx={{
        borderRadius: 3,
        transition: hover ? 'all 0.2s ease-in-out' : 'none',
        '&:hover': hover ? {
          elevation: 3,
          transform: 'translateY(-2px)'
        } : {},
        ...sx
      }}
    >
      <CardContent sx={{ p: padding }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default CustomCard;
