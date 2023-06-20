import {
  Box, Grid, Slider, Typography,
} from '@mui/material';
import React, { useState } from 'react';
import useQueue from 'hooks/useQueue';
import { useQueueId } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';

const Seekbar = () => {
  const player = usePlayerContext();
  const queueId = useQueueId();
  const [displayRemaining, setDisplayRemaining] = useState(true);
  const [draggingPosition, setDraggingPosition] = useState<number>(0);
  const [isHovered, setHovered] = useState(false);
  const { data: nowPlaying } = useNowPlaying();
  const { data: playerState } = usePlayerState();
  const { updateTimeline } = useQueue();

  const changePosition = (event: Event, newValue: number | number[]) => {
    const nodes = document.querySelectorAll('span.seekbar-value');
    nodes.forEach((node) => {
      node.classList.add('no-update');
    });
    setDraggingPosition(newValue as number);
  };

  const commitPosition = async (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    const nodes = document.querySelectorAll('span.seekbar-value');
    nodes.forEach((node) => {
      node.classList.remove('no-update');
    });
    player.setPosition(newValue as number);
    if (nowPlaying) {
      await updateTimeline(
        nowPlaying.id,
        playerState.isPlaying ? 'playing' : 'paused',
        player.currentPosition(),
        nowPlaying.track,
      );
    }
  };

  return (
    <Box
      sx={{
        color: 'text.primary',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40%',
      }}
    >
      <Grid container>
        <Grid item display="flex" justifyContent="flex-end" width="50px">
          <Typography mr="8px" mt="4px" position="absolute" variant="subtitle2">
            <span className="seekbar-text">{queueId === 0 ? '--:--' : ''}</span>
          </Typography>
        </Grid>
        <Grid item xs>
          <Slider
            disabled={queueId === 0}
            max={playerState.duration || 1}
            min={0}
            size="small"
            slotProps={{
              thumb: { className: 'seekbar-value' }, track: { className: 'seekbar-value' },
            }}
            sx={{
              '& .MuiSlider-thumb': {
                display: isHovered ? 'flex' : 'none',
              },
            }}
            value={queueId === 0 ? 0 : draggingPosition}
            onChange={changePosition}
            onChangeCommitted={commitPosition}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          />
        </Grid>
        <Grid
          item
          display="flex"
          justifyContent="flex-start"
          width="50px"
          onClick={() => setDisplayRemaining(!displayRemaining)}
        >
          {displayRemaining
            && (
              <Typography ml="8px" mt="4px" position="absolute" variant="subtitle2">
                <span className="seekbar-text remaining">{queueId === 0 ? '--:--' : ''}</span>
              </Typography>
            )}
          {!displayRemaining
            && (
              <Typography ml="8px" mt="4px" position="absolute" variant="subtitle2">
                <span className="seekbar-text duration">{queueId === 0 ? '--:--' : ''}</span>
              </Typography>
            )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Seekbar;
