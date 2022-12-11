import {
  Box, MenuItem, Paper, Select, SelectChangeEvent, Switch, Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useCallback } from 'react';
import { appQueryKeys, useSettings } from 'queries/app-queries';
import { IAppSettings } from 'types/interfaces';

const boxStyle = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
};

const switchStyle = {
  width: '58px',
  height: '38px',
  padding: '8px',
  transform: 'translate(8px, 0px)',
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
  '& .Mui-disabled': {
    '& .MuiSwitch-thumb': {
      color: 'action.selected',
    },
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
  const updateConfig = useCallback(async (key: keyof IAppSettings, value: any) => {
    const newSettings = structuredClone(settings);
    newSettings[key] = value;
    window.electron.writeConfig('settings', newSettings);
    await queryClient.refetchQueries(appQueryKeys.settings);
  }, [settings, queryClient]);

  const handleDarkModeOption = async () => {
    await updateConfig('colorMode', (settings.colorMode === 'light' ? 'dark' : 'light'));
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

  const handleAlbumSortOption = async (e: SelectChangeEvent) => {
    await updateConfig('albumSort', { by: e.target.value, order: settings.albumSort?.order });
  };

  const handleAlbumOrderOption = async (e: SelectChangeEvent) => {
    await updateConfig('albumSort', { by: settings.albumSort?.by, order: e.target.value });
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
      <Typography mt={1} sx={{ fontWeight: 600 }} variant="h5">Artist Page</Typography>
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
      <Typography sx={{ fontWeight: 600 }} variant="body1">Album Sorting</Typography>
      <Box mt={-1} sx={{ ...boxStyle, height: 38 }}>
        <Typography sx={{ lineHeight: 1.1 }} variant="subtitle2">
          Default album sort
        </Typography>
        <Typography sx={{ lineHeight: 1.1, ml: 'auto' }} variant="subtitle2">
          by:
        </Typography>
        <Select
          disableUnderline
          MenuProps={{
            sx: {
              marginTop: '4px',
            },
          }}
          SelectDisplayProps={{
            style: {
              paddingLeft: '4px',
            },
          }}
          inputProps={{
            sx: {
              backgroundColor: 'action.disabledBackground',
              borderRadius: '4px',
              '&:focus': {
                backgroundColor: 'action.disabledBackground',
                borderRadius: '4px',
              },
            },
          }}
          sx={{
            ml: '4px',
            width: 130,
          }}
          value={settings.albumSort?.by}
          variant="standard"
          onChange={handleAlbumSortOption}
        >
          <MenuItem value="added">Date Added</MenuItem>
          <MenuItem value="played">Last Played</MenuItem>
          <MenuItem value="plays">Playcount</MenuItem>
          <MenuItem value="date">Release Date</MenuItem>
          <MenuItem value="type">Release Type</MenuItem>
          <MenuItem value="title">Title</MenuItem>
        </Select>
        <Typography sx={{ lineHeight: 1.1, ml: '8px' }} variant="subtitle2">
          order:
        </Typography>
        <Select
          disableUnderline
          MenuProps={{
            sx: {
              marginTop: '4px',
            },
          }}
          SelectDisplayProps={{
            style: {
              paddingLeft: '4px',
            },
          }}
          inputProps={{
            sx: {
              backgroundColor: 'action.disabledBackground',
              borderRadius: '4px',
              '&:focus': {
                backgroundColor: 'action.disabledBackground',
                borderRadius: '4px',
              },
            },
          }}
          sx={{
            ml: '4px',
            width: 120,
          }}
          value={settings.albumSort?.order}
          variant="standard"
          onChange={handleAlbumOrderOption}
        >
          <MenuItem value="asc">Ascending</MenuItem>
          <MenuItem value="desc">Descending</MenuItem>
        </Select>
      </Box>
    </Paper>
  );
};

export default Settings;
