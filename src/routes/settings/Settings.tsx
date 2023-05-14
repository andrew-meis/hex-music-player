import {
  Box,
  IconButton,
  Input,
  InputAdornment,
  MenuItem,
  Paper,
  SelectChangeEvent,
  SvgIcon,
  Switch,
  Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useRef } from 'react';
import { BiPaste } from 'react-icons/all';
import { useOutletContext } from 'react-router-dom';
import Select from 'components/select/Select';
import { WIDTH_CALC } from 'constants/measures';
import { appQueryKeys, useSettings } from 'queries/app-queries';
import { AppSettings } from 'types/interfaces';

const boxStyle = {
  alignItems: 'center',
  display: 'flex',
  justifyContent: 'space-between',
  marginTop: 0.5,
};

const switchStyle = {
  marginLeft: 'auto',
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
  const inputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();
  const { height } = useOutletContext() as { height: number };
  const updateConfig = useCallback(async (key: keyof AppSettings, value: any) => {
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

  const handleAlbumSortOption = async (e: SelectChangeEvent<unknown>) => {
    await updateConfig('albumSort', { by: e.target.value, order: settings.albumSort?.order });
  };

  const handleAlbumOrderOption = async (e: SelectChangeEvent<unknown>) => {
    await updateConfig('albumSort', { by: settings.albumSort?.by, order: e.target.value });
  };

  const pasteText = async () => {
    const text = await navigator.clipboard.readText();
    if (text.length === 32 && !!inputRef.current) {
      inputRef.current.value = text;
      await updateConfig('apiKey', text);
    }
  };

  return (
    <Box
      className="scroll-container"
      height={height}
      overflow="auto"
      width={1}
    >
      <Paper
        elevation={0}
        sx={{
          backgroundColor: 'transparent',
          margin: 'auto',
          maxWidth: '600px',
          pt: 2,
          width: WIDTH_CALC,
        }}
      >
        <Typography variant="h1">Settings</Typography>
        <Typography mt={1.5} sx={{ fontWeight: 600 }} variant="h5">App-wide</Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Dark Mode</Typography>
          <Switch
            checked={settings.colorMode === 'dark'}
            sx={switchStyle}
            onChange={handleDarkModeOption}
          />
        </Box>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Docked Queue</Typography>
          <Switch
            checked={settings.dockedQueue}
            disabled={settings.compactQueue}
            sx={switchStyle}
            onChange={handleQueueDrawerOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Use a smaller version of the queue toolbar
        </Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Queue</Typography>
          <Switch
            checked={settings.compactQueue}
            disabled={settings.dockedQueue}
            sx={switchStyle}
            onChange={handleMiniQueueOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Use a smaller version of the queue toolbar
        </Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Navigation</Typography>
          <Switch
            checked={settings.compactNav}
            sx={switchStyle}
            onChange={handleCompactNavOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Use a smaller version of the navigation sidebar
        </Typography>
        <Typography mt={1.5} sx={{ fontWeight: 600 }} variant="h5">Artist Page</Typography>
        <Box sx={boxStyle}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Album Grid Text</Typography>
          <Switch
            checked={settings.albumText}
            sx={switchStyle}
            onChange={handleAlbumTextOption}
          />
        </Box>
        <Typography mt={-1} variant="subtitle2">
          Always show album title in album grid views
        </Typography>
        <Box sx={{ ...boxStyle, height: 38 }}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">Sorting</Typography>
          <Typography sx={{ ml: 'auto' }} variant="subtitle2">
            by:
          </Typography>
          <Select
            value={settings.albumSort?.by}
            onChange={handleAlbumSortOption}
          >
            <MenuItem value="addedAt">Date Added</MenuItem>
            <MenuItem value="lastViewedAt">Last Played</MenuItem>
            <MenuItem value="viewCount">Playcount</MenuItem>
            <MenuItem value="originallyAvailableAt">Release Date</MenuItem>
            <MenuItem value="section">Release Type</MenuItem>
            <MenuItem value="title">Title</MenuItem>
          </Select>
          <Typography sx={{ ml: '8px' }} variant="subtitle2">
            order:
          </Typography>
          <Select
            value={settings.albumSort?.order}
            onChange={handleAlbumOrderOption}
          >
            <MenuItem value="asc">Ascending</MenuItem>
            <MenuItem value="desc">Descending</MenuItem>
          </Select>
        </Box>
        <Typography mt={-0.5} variant="subtitle2">
          Default album sort values
        </Typography>
        <Typography mt={1.5} sx={{ fontWeight: 600 }} variant="h5">Last.fm Integration</Typography>
        <Box sx={{ ...boxStyle, height: '38px' }}>
          <Typography sx={{ fontWeight: 600 }} variant="body1">API Key</Typography>
          <Input
            disabled
            endAdornment={(
              <InputAdornment position="end">
                <IconButton
                  disableRipple
                  edge="end"
                  onClick={pasteText}
                >
                  <SvgIcon>
                    <BiPaste />
                  </SvgIcon>
                </IconButton>
              </InputAdornment>
            )}
            inputProps={{
              style: {
                width: '32ch',
              },
            }}
            inputRef={inputRef}
            value={settings.apiKey || ''}
          />
        </Box>
        <Typography mt={-0.5} variant="subtitle2">
          Paste your last.fm API key here
        </Typography>
      </Paper>
    </Box>
  );
};

export default Settings;
