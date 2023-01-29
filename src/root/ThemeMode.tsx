import { useColorScheme } from '@mui/material';
import { useEffect } from 'react';
import { IAppSettings } from 'types/interfaces';

export const ThemeMode = ({ settings }: {settings: IAppSettings}) => {
  const { setMode } = useColorScheme();

  useEffect(() => {
    setMode(settings.colorMode || 'dark');
  }, [setMode, settings.colorMode]);

  return null;
};

export default ThemeMode;
