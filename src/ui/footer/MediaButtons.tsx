import { Box } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { appQueryKeys, useSettings } from 'queries/app-queries';
import { usePlayerContext } from 'root/Player';
import Next from './buttons/Next';
import PlayPause from './buttons/PlayPause';
import Previous from './buttons/Previous';
import Repeat from './buttons/Repeat';
import Shuffle from './buttons/Shuffle';

const MediaButtons = () => {
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const { data: settings } = useSettings();

  const handleRepeat = useCallback(async (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => {
    const newSettings = structuredClone(settings);
    newSettings.repeat = value;
    window.electron.writeConfig('settings', newSettings);
    await queryClient.refetchQueries(appQueryKeys.settings);
    if (value === 'repeat-one') {
      player.loop = true;
      player.singleMode = true;
      return;
    }
    if (value === 'repeat-none') {
      player.loop = false;
      player.singleMode = false;
      return;
    }
    if (value === 'repeat-all') {
      player.loop = true;
      player.singleMode = false;
    }
  }, [settings, queryClient, player]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40%',
      }}
    >
      <Shuffle />
      <span style={{ width: 5 }} />
      <Previous handleRepeat={handleRepeat} />
      <PlayPause />
      <Next handleRepeat={handleRepeat} />
      <span style={{ width: 5 }} />
      <Repeat handleRepeat={handleRepeat} />
    </Box>
  );
};

export default MediaButtons;
