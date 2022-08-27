import { Box, IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import {
  IoPlaySkipBack,
  IoPlaySkipForward,
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiRepeat2Fill,
  RiRepeatOneFill,
  RiShuffleFill,
  RiStopCircleFill,
} from 'react-icons/all';
import { PlayQueueItem } from 'hex-plex';
import useKeyPress from '../../hooks/useKeyPress';
import { iconButtonStyle } from '../../constants/style';
import { useCurrentQueue, usePlayerState, useQueueId } from '../../hooks/queryHooks';
import useQueue from '../../hooks/useQueue';
import { usePlayerContext } from '../../core/Player';
import { isPlayQueueItem } from '../../types/type-guards';

const { platform } = window.electron.getAppInfo();

const MediaButtons = () => {
  const ctrlPress = useKeyPress(platform === 'darwin' ? 'Meta' : 'Control');
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const repeatMode = 'repeat-none';
  const shuffleMode = false;
  const [disableNext, setDisableNext] = useState(false);
  const [disablePrev, setDisablePrev] = useState(false);
  const { data: playerState } = usePlayerState();
  const { data: playQueue } = useCurrentQueue();
  const { data: queueId } = useQueueId();
  const { updateTimeline } = useQueue();

  let currentIndex: number;
  let nowPlaying: PlayQueueItem | boolean = false;
  let nextTrack: PlayQueueItem | boolean = false;
  let prevTrack: PlayQueueItem | boolean = false;
  if (playQueue) {
    currentIndex = playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId);
    nowPlaying = playQueue.items[currentIndex];
    nextTrack = playQueue.items[currentIndex + 1];
    prevTrack = playQueue.items[currentIndex - 1];
  }

  const getPlayIcon = () => {
    if (!!nowPlaying && ctrlPress) {
      return <RiStopCircleFill />;
    }
    if (playerState.isPlaying) {
      return <RiPauseCircleFill />;
    }
    return <RiPlayCircleFill />;
  };

  const handleNext = async () => {
    setDisableNext(true);
    if (isPlayQueueItem(nowPlaying)) {
      await updateTimeline(nowPlaying.id, 'stopped', player.currentPosition(), nowPlaying.track);
      if (isPlayQueueItem(nextTrack)) {
        await updateTimeline(nextTrack.id, 'playing', 0, nextTrack.track);
      }
      await queryClient.refetchQueries(['play-queue', queueId]);
      const newQueue = queryClient.getQueryData(['play-queue', queueId]);
      player.next();
      if (!playerState.isPlaying) {
        player.play();
      }
      player.updateTracks(newQueue, 'next');
      queryClient.setQueryData(
        ['player-state'],
        () => ({ ...playerState, isPlaying: true, position: 0 }),
      );
      setDisableNext(false);
    }
  };

  const handlePrev = async () => {
    setDisablePrev(true);
    // cue current track if no previous track or more than five seconds have elapsed
    if (!prevTrack || player.currentPosition() > 5000) {
      if (isPlayQueueItem(nowPlaying)) {
        await updateTimeline(
          nowPlaying.id,
          'stopped',
          playerState.position,
          nowPlaying.track,
        );
      }
      const { trackNumber } = player.playlist;
      player.cue();
      player.playlist.trackNumber = trackNumber;
      if (!playerState.isPlaying) {
        player.pause();
      }
      if (isPlayQueueItem(nowPlaying)) {
        await updateTimeline(
          nowPlaying.id,
          playerState.isPlaying ? 'playing' : 'paused',
          0,
          nowPlaying.track,
        );
      }
      queryClient.setQueryData(
        ['player-state'],
        () => ({ ...playerState, position: 0 }),
      );
      setDisablePrev(false);
      return;
    }
    // else go to previous track
    if (isPlayQueueItem(nowPlaying)) {
      await updateTimeline(nowPlaying.id, 'stopped', player.currentPosition(), nowPlaying.track);
      if (isPlayQueueItem(prevTrack)) {
        await updateTimeline(prevTrack.id, 'playing', 0, prevTrack.track);
        player.startTimer(prevTrack);
      }
      await queryClient.refetchQueries(['play-queue', queueId]);
      const newQueue = queryClient.getQueryData(['play-queue', queueId]);
      player.updateTracks(newQueue, 'prev');
      queryClient.setQueryData(
        ['player-state'],
        () => ({ ...playerState, isPlaying: true, position: 0 }),
      );
      setDisablePrev(false);
    }
  };

  const handlePlayPause = async () => {
    if (ctrlPress) {
      if (nowPlaying && isPlayQueueItem(nowPlaying)) {
        player.clearTimer();
        await updateTimeline(nowPlaying.id, 'stopped', playerState.position, nowPlaying.track);
      }
      await player.resetApp();
      return;
    }
    if (playerState.isPlaying) {
      player.pause();
      if (isPlayQueueItem(nowPlaying)) {
        player.clearTimer();
        updateTimeline(nowPlaying.id, 'paused', playerState.position, nowPlaying.track);
      }
      queryClient.setQueryData(
        ['player-state'],
        () => ({ ...playerState, isPlaying: false }),
      );
    }
    if (!playerState.isPlaying) {
      player.play();
      if (isPlayQueueItem(nowPlaying)) {
        updateTimeline(nowPlaying.id, 'playing', playerState.position, nowPlaying.track);
        player.startTimer(nowPlaying);
      }
      queryClient.setQueryData(
        ['player-state'],
        () => ({ ...playerState, isPlaying: true }),
      );
    }
  };

  const handleShuffle = () => {
    console.log('shuffle button');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: '40%',
      }}
    >
      <IconButton
        disableRipple
        disabled={!nowPlaying}
        size="small"
        sx={{
          ...iconButtonStyle,
          color: shuffleMode ? 'primary.main' : 'text.secondary',
          '&:hover': {
            backgroundColor: 'transparent',
            color: shuffleMode ? 'primary.main' : 'text.primary',
          },
        }}
        onClick={handleShuffle}
      >
        <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiShuffleFill /></SvgIcon>
      </IconButton>
      <span style={{ width: 5 }} />
      <IconButton
        disableRipple
        disabled={queueId === 0 || disablePrev}
        size="small"
        sx={iconButtonStyle}
        onClick={handlePrev}
      >
        <SvgIcon sx={{ width: '0.9em', height: '1em' }}><IoPlaySkipBack /></SvgIcon>
      </IconButton>
      <IconButton
        disableRipple
        disabled={queueId === 0}
        sx={{
          ...iconButtonStyle,
          '&:active': { transform: 'scale(0.93)' },
        }}
        onClick={handlePlayPause}
      >
        <SvgIcon sx={{ width: '1.7em', height: '1.7em' }}>
          {getPlayIcon()}
        </SvgIcon>
      </IconButton>
      <IconButton
        disableRipple
        disabled={queueId === 0 || disableNext || !nextTrack}
        size="small"
        sx={iconButtonStyle}
        onClick={handleNext}
      >
        <SvgIcon sx={{ width: '0.9em', height: '1em' }}><IoPlaySkipForward /></SvgIcon>
      </IconButton>
      <span style={{ width: 5 }} />
      {repeatMode === 'repeat-none'
        && (
          <IconButton
            disableRipple
            size="small"
            sx={{ ...iconButtonStyle }}
            onClick={() => console.log('repeat')}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeat2Fill /></SvgIcon>
          </IconButton>
        )}
      {/* @ts-ignore */}
      {repeatMode === 'repeat-all'
        && (
          <IconButton
            disableRipple
            size="small"
            sx={{
              ...iconButtonStyle,
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
            }}
            onClick={() => console.log('repeat')}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeat2Fill /></SvgIcon>
          </IconButton>
        )}
      {/* @ts-ignore */}
      {repeatMode === 'repeat-one'
        && (
          <IconButton
            disableRipple
            size="small"
            sx={{
              ...iconButtonStyle,
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
            }}
            onClick={() => console.log('repeat')}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeatOneFill /></SvgIcon>
          </IconButton>
        )}
    </Box>
  );
};

export default MediaButtons;
