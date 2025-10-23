import React from 'react';
import { Box, Typography } from '@mui/material';

const Section = ({ 
  title, 
  subtitle, 
  children, 
  spacing = 4, 
  titleSpacing = 3,
  sx = {} 
}) => {
  return (
    <Box sx={{ mb: spacing, ...sx }}>
      {(title || subtitle) && (
        <Box sx={{ mb: titleSpacing }}>
          {title && (
            <Typography 
              variant="h5" 
              component="h2" 
              sx={{ 
                fontWeight: 'bold',
                mb: subtitle ? 1 : 0,
                color: 'text.primary'
              }}
            >
              {title}
            </Typography>
          )}
          {subtitle && (
            <Typography 
              variant="body2" 
              color="text.secondary"
              sx={{ lineHeight: 1.6 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>
      )}
      {children}
    </Box>
  );
};

export default Section;
