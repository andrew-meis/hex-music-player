import { useTheme } from '@mui/material';
import React, { useMemo } from 'react';

const useMenuStyle = () => {
  const theme = useTheme();

  return useMemo(() => (
    {
      fontSize: '0.875rem',
      '--menu-border': theme.palette.border.main,
      '--menu-color': theme.palette.text.primary,
      '--menu-paper': theme.palette.background.paper,
      '--menu-primary': theme.palette.primary.main,
      '--menu-transparent': `${theme.palette.primary.main}cc`,
    } as React.CSSProperties
  ), [theme]);
};

export default useMenuStyle;
