import { Box } from '@mui/material';
import { useAtom } from 'jotai';
import { useCallback } from 'react';
import { usePlayerContext } from 'root/Player';
import { settingsAtom } from 'root/Root';
import Next from './media-control/Next';
import PlayPause from './media-control/PlayPause';
import Previous from './media-control/Previous';
import Repeat from './media-control/Repeat';
import Shuffle from './media-control/Shuffle';

const MediaControl = () => {
  const player = usePlayerContext();
  const [settings, setSettings] = useAtom(settingsAtom);

  const handleRepeat = useCallback((value: 'repeat-none' | 'repeat-one' | 'repeat-all') => {
    const newSettings = structuredClone(settings);
    newSettings.repeat = value;
    setSettings(newSettings);
    if (value === 'repeat-one') {
      player.loop = true;
      player.singleMode = true;
      return;
    }
    player.loop = false;
    player.singleMode = false;
  }, [settings, setSettings, player]);

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

export default MediaControl;
