import React, { ReactNode, useMemo } from 'react';
import { createTheme, ThemeProvider } from '@mui/material';
import { useSettings } from '../hooks/queryHooks';

declare module '@mui/material/styles' {
  interface Palette {
    border: Palette['primary'];
  }
  interface PaletteOptions {
    border: PaletteOptions['primary'];
  }
}

const Theme = ({ children }: {children: ReactNode}) => {
  const { data: settings } = useSettings();

  const customBackgrounds = useMemo(
    () => (settings.colorMode === 'light'
      ? { default: '#fefefe', grey: '#616161', paper: '#fdfdfd' }
      : { grey: '#e0e0e0' }),
    [settings],
  );

  const customText = useMemo(
    () => (settings.colorMode === 'light'
      ? { primary: 'rgba(0, 0, 0, 0.95)', secondary: 'rgba(0, 0, 0, 0.7)' }
      : {}),
    [settings],
  );

  const theme = useMemo(
    () => createTheme({
      palette: {
        mode: settings.colorMode,
        border: {
          main: settings.colorMode === 'light' ? '#e0e0e0' : '#616161',
        },
        primary: {
          main: '#1caf7b',
          light: '#3ee0a7',
          dark: '#147b57',
        },
        secondary: {
          main: '#fc4283',
          light: '#fd8eb5',
          dark: '#bd3162',
        },
        success: {
          main: '#6cda71',
        },
        info: {
          main: '#4eb9ff',
        },
        error: {
          main: '#ff6255',
        },
        common: {
          black: '#101010',
          white: '#f9f9f9',
        },
        background: {
          ...customBackgrounds,
        },
        text: {
          ...customText,
        },
      },
      typography: {
        fontFamily: 'Arimo, sans-serif',
      },
    }),
    [settings.colorMode, customBackgrounds, customText],
  );

  return (
    <ThemeProvider theme={theme}>
      {children}
    </ThemeProvider>
  );
};

export default Theme;
