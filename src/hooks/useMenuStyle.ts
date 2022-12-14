import { useTheme } from '@mui/material';
import React, { useMemo } from 'react';

const useMenuStyle = () => {
  const theme = useTheme();

  return useMemo(() => (
    {
      fontSize: '0.875rem',
      '--menu-border': theme.palette.border.main,
      '--menu-color': theme.palette.text.primary,
      '--menu-gradient': theme.palette.mode === 'light'
        ? ''
        : theme.palette.action.disabledBackground,
      '--menu-paper': theme.palette.background.paper,
      '--menu-primary': theme.palette.action.selected,
    } as React.CSSProperties
  ), [theme]);
};

export default useMenuStyle;
