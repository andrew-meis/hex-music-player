import { useColorScheme } from '@mui/material';
import { useEffect } from 'react';
import { AppSettings } from 'types/interfaces';

export const ThemeMode = ({ settings }: { settings: AppSettings }) => {
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(settings.colorMode || 'dark');
  }, [setMode, settings.colorMode]);

  return null;
};

export default ThemeMode;
