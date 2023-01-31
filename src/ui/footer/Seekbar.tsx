import {
  Box, Grid, Slider, Typography,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import useFormattedTime from 'hooks/useFormattedTime';
import useQueue from 'hooks/useQueue';
import { useQueueId } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { QueryKeys } from 'types/enums';

const Seekbar = () => {
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const [displayRemaining, setDisplayRemaining] = useState(true);
  const [draggingPosition, setDraggingPosition] = useState<number>(0);
  const [isHovered, setHovered] = useState(false);
  const { data: nowPlaying } = useNowPlaying();
  const { data: playerState } = usePlayerState();
  const { getFormattedTime } = useFormattedTime();
  const { updateTimeline } = useQueue();

  const changePosition = (event: Event, newValue: number | number[]) => {
    setDraggingPosition(newValue as number);
  };

  const commitPosition = async (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    player.setPosition(newValue as number);
    queryClient.setQueryData(
      [QueryKeys.PLAYER_STATE],
      () => ({ ...playerState, position: newValue }),
    );
    if (nowPlaying) {
      await updateTimeline(
        nowPlaying.id,
        playerState.isPlaying ? 'playing' : 'paused',
        player.currentPosition(),
        nowPlaying.track,
      );
    }
    setDraggingPosition(0);
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
            {queueId === 0 ? '--:--' : getFormattedTime(
              Math.round(draggingPosition / 1000 || playerState.position / 1000) * 1000,
            )}
          </Typography>
        </Grid>
        <Grid item xs>
          <Slider
            disabled={queueId === 0}
            max={playerState.duration || 1}
            min={0}
            size="small"
            sx={{
              '& .MuiSlider-thumb': {
                display: isHovered ? 'flex' : 'none',
              },
            }}
            value={queueId === 0 ? 0 : draggingPosition || playerState.position}
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
                {queueId === 0 ? '---:--' : `-${getFormattedTime(
                  playerState.duration - (
                    Math.round(draggingPosition / 1000 || playerState.position / 1000) * 1000
                  ),
                )}`}
              </Typography>
            )}
          {!displayRemaining
            && (
              <Typography ml="8px" mt="4px" position="absolute" variant="subtitle2">
                {queueId === 0 ? '--:--' : getFormattedTime(playerState.duration)}
              </Typography>
            )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default Seekbar;
