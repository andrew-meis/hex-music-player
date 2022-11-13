import {
  Box, Paper, Switch, Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { useSettings } from '../../hooks/queryHooks';
import { AppSettings } from '../../types/interfaces';

const boxStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const switchStyle = {
  width: '58px',
  height: '38px',
  padding: '8px',
  '& .MuiSwitch-switchBase': {
    padding: '10px',
    '&.Mui-checked': {
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: 'primary.main',
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: 'none',
    width: '18px',
    height: '18px',
    color: 'common.white',
  },
  '& .MuiSwitch-track': {
    backgroundColor: 'grey.500',
    borderRadius: '10px',
  },
  '& .MuiSwitch-switchBase:hover': {
    backgroundColor: 'transparent',
  },
  '& .MuiSwitch-switchBase.Mui-checked:hover': {
    backgroundColor: 'transparent',
  },
};

const Settings = () => {
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const updateConfig = useCallback(async (key: keyof AppSettings, value: any) => {
    const newSettings = structuredClone(settings);
    newSettings[key] = value;
    window.electron.writeConfig('settings', newSettings);
    await queryClient.refetchQueries(['settings']);
  }, [settings, queryClient]);

  const handleDarkModeOption = async () => {
    await updateConfig('colorMode', (settings.colorMode === 'light' ? 'dark' : 'light'));
  };

  const handleGlassEffectOption = () => {
    // dispatch(setOptions({ type: 'glassEffect', value: !options.glassEffect }));
  };

  const handleQueueDrawerOption = async () => {
    await updateConfig('dockedQueue', !settings.dockedQueue);
  };

  const handleMiniQueueOption = async () => {
    await updateConfig('compactQueue', !settings.compactQueue);
  };

  const handleCompactNavOption = async () => {
    await updateConfig('compactNav', !settings.compactNav);
  };

  const handleAlbumTextOption = async () => {
    await updateConfig('albumText', !settings.albumText);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        width: '70%',
        maxWidth: '600px',
        backgroundColor: 'transparent',
        pt: 2,
        margin: 'auto',
      }}
    >
      <Typography sx={{ fontWeight: 600 }} variant="h4">Settings</Typography>
      <Typography mt={1} sx={{ fontWeight: 600 }} variant="h5">App-wide</Typography>
      <Box sx={boxStyle}>
        <Typography sx={{ fontWeight: 600 }} variant="body1">Dark Mode</Typography>
        <Switch
          checked={settings.colorMode === 'dark'}
          sx={switchStyle}
          onChange={handleDarkModeOption}
        />
      </Box>
      <Typography sx={{ fontWeight: 600 }} variant="body1">Glass Effect</Typography>
      <Box mt={-1} sx={boxStyle}>
        <Typography sx={{ lineHeight: 1.1 }} variant="subtitle2">
          Blur the album artwork of the current track behind the application menus
        </Typography>
        <Switch
          // checked={options.glassEffect}
          sx={switchStyle}
          onChange={handleGlassEffectOption}
        />
      </Box>
      <Typography sx={{ fontWeight: 600 }} variant="body1">Docked Queue</Typography>
      <Box mt={-1} sx={boxStyle}>
        <Typography sx={{ lineHeight: 1.1 }} variant="subtitle2">
          Keep the queue displayed on the right side of the window
        </Typography>
        <Switch
          checked={settings.dockedQueue}
          disabled={settings.compactQueue}
          sx={switchStyle}
          onChange={handleQueueDrawerOption}
        />
      </Box>
      <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Queue</Typography>
      <Box mt={-1} sx={boxStyle}>
        <Typography sx={{ lineHeight: 1.1 }} variant="subtitle2">
          Use a smaller version of the queue toolbar
        </Typography>
        <Switch
          checked={settings.compactQueue}
          disabled={settings.dockedQueue}
          sx={switchStyle}
          onChange={handleMiniQueueOption}
        />
      </Box>
      <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Navigation</Typography>
      <Box mt={-1} sx={boxStyle}>
        <Typography sx={{ lineHeight: 1.1 }} variant="subtitle2">
          Use a smaller version of the navigation sidebar
        </Typography>
        <Switch
          checked={settings.compactNav}
          sx={switchStyle}
          onChange={handleCompactNavOption}
        />
      </Box>
      <Typography sx={{ fontWeight: 600 }} variant="body1">Album Grid Text</Typography>
      <Box mt={-1} sx={boxStyle}>
        <Typography sx={{ lineHeight: 1.1 }} variant="subtitle2">
          Always show album title in album grid views
        </Typography>
        <Switch
          checked={settings.albumText}
          sx={switchStyle}
          onChange={handleAlbumTextOption}
        />
      </Box>
    </Paper>
  );
};

export default Settings;
