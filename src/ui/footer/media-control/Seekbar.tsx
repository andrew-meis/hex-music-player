import { Box, Grid, Slider, Typography } from '@mui/material';
import { useAtom, useAtomValue, useSetAtom, useStore } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { isBoolean } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import useFormattedTime from 'hooks/useFormattedTime';
import useQueue from 'hooks/useQueue';
import { useNowPlaying } from 'queries/plex-queries';
import {
  playbackProgressAtom,
  playbackDurationAtom,
  usePlayerContext,
  playbackIsPlayingAtom,
} from 'root/Player';
import { queueIdAtom } from 'root/Root';

export const displayRemainingAtom = atomWithStorage('display-remaining', true, {
  getItem: (key, initialValue) => {
    const savedValue = window.electron.readConfig(key);
    if (!isBoolean(savedValue)) return initialValue;
    return savedValue as boolean;
  },
  setItem: (key, newValue) => window.electron.writeConfig(key, newValue),
  removeItem: (key) => window.electron.writeConfig(key, true),
});

const Seekbar = () => {
  const store = useStore();
  const duration = useAtomValue(playbackDurationAtom);
  const isPlaying = useAtomValue(playbackIsPlayingAtom);

  const elapsed = useRef<HTMLSpanElement>(null);
  const remaining = useRef<HTMLSpanElement>(null);
  const thumb = useRef<HTMLSpanElement>(null);
  const track = useRef<HTMLSpanElement>(null);

  const player = usePlayerContext();
  const queueId = useAtomValue(queueIdAtom);
  const [draggingPosition, setDraggingPosition] = useState(0);
  const setPlayerPosition = useSetAtom(playbackProgressAtom);
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { updateTimeline } = useQueue();
  const [displayRemaining, setDisplayRemaining] = useAtom(displayRemainingAtom);

  useEffect(() => {
    if (queueId === 0) {
      if (!elapsed.current || !remaining.current || !thumb.current || !track.current) return;
      thumb.current.style.left = '0%';
      track.current.style.width = '0%';
    }
  }, [queueId]);

  useEffect(() => {
    store.sub(playbackProgressAtom, () => {
      if (!elapsed.current || !remaining.current || !thumb.current || !track.current) return;
      const newProgress = store.get(playbackProgressAtom);
      if (draggingPosition) {
        elapsed.current.innerText = getFormattedTime(draggingPosition);
        remaining.current.innerText = displayRemaining
          ? `-${getFormattedTime(newProgress.duration - draggingPosition)}`
          : getFormattedTime(newProgress.duration);
      }
      if (!draggingPosition) {
        elapsed.current.innerText = getFormattedTime(newProgress.position);
        remaining.current.innerText = displayRemaining
          ? `-${getFormattedTime(newProgress.duration - newProgress.position)}`
          : getFormattedTime(newProgress.duration);
      }
      thumb.current.style.left = `
        ${((draggingPosition || newProgress.position) / newProgress.duration) * 100}%
      `;
      track.current.style.width = `
        ${((draggingPosition || newProgress.position) / newProgress.duration) * 100}%
      `;
    });
  }, [displayRemaining, draggingPosition, getFormattedTime, store]);

  const changePosition = (event: Event, newValue: number | number[]) => {
    setDraggingPosition(newValue as number);
  };

  const commitPosition = async (
    event: React.SyntheticEvent | Event,
    newValue: number | number[],
  ) => {
    setDraggingPosition(0);
    player.setPosition(newValue as number);
    setPlayerPosition((state) => ({ ...state, position: newValue as number }));
    if (nowPlaying) {
      await updateTimeline(
        nowPlaying.id,
        isPlaying ? 'playing' : 'paused',
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
            <span ref={elapsed}>{queueId === 0 ? '--:--' : ''}</span>
          </Typography>
        </Grid>
        <Grid item xs>
          <Slider
            disabled={queueId === 0}
            max={duration || 1}
            min={0}
            size="small"
            slotProps={{
              thumb: {
                ref: thumb,
              },
              track: {
                ref: track,
              },
            }}
            sx={{
              '& .MuiSlider-thumb': {
                display: 'none',
              },
              '&:hover': {
                '& .MuiSlider-thumb': {
                  display: 'flex',
                },
              },
            }}
            value={0}
            onChange={changePosition}
            onChangeCommitted={commitPosition}
          />
        </Grid>
        <Grid
          item
          display="flex"
          justifyContent="flex-start"
          width="50px"
          onClick={() => setDisplayRemaining(!displayRemaining)}
        >
          <Typography ml="8px" mt="4px" position="absolute" variant="subtitle2">
            <span ref={remaining}>{queueId === 0 ? '--:--' : ''}</span>
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Seekbar;
