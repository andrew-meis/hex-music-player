import { Box, IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
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
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import useKeyPress from 'hooks/useKeyPress';
import useQueue from 'hooks/useQueue';
import { appQueryKeys, useQueueId, useSettings } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { QueryKeys } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';
import type { PlayQueueItem } from 'hex-plex';

const { platform } = window.electron.getAppInfo();

const popperProps = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, -8],
      },
    },
  ],
};

const MediaButtons = () => {
  const ctrlPress = useKeyPress(platform === 'darwin' ? 'Meta' : 'Control');
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const [disableNext, setDisableNext] = useState(false);
  const [disablePrev, setDisablePrev] = useState(false);
  const { data: playerState } = usePlayerState();
  const { data: playQueue } = useCurrentQueue();
  const { data: settings } = useSettings();
  const { toggleShuffle, updateQueue, updateTimeline } = useQueue();

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

  const getPlayText = () => {
    if (!!nowPlaying && ctrlPress) {
      return 'Stop';
    }
    if (playerState.isPlaying) {
      return 'Pause';
    }
    return 'Play';
  };

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

  const handleNext = useCallback(async () => {
    setDisableNext(true);
    await handleRepeat('repeat-none');
    if (isPlayQueueItem(nowPlaying)) {
      await updateTimeline(nowPlaying.id, 'stopped', player.currentPosition(), nowPlaying.track);
      if (isPlayQueueItem(nextTrack)) {
        await updateTimeline(nextTrack.id, 'playing', 0, nextTrack.track);
      }
      await queryClient.refetchQueries([QueryKeys.PLAYQUEUE, queueId]);
      const newQueue = queryClient.getQueryData([QueryKeys.PLAYQUEUE, queueId]);
      player.next();
      if (!playerState.isPlaying) {
        player.play();
      }
      player.updateTracks(newQueue, 'next');
      queryClient.setQueryData(
        [QueryKeys.PLAYER_STATE],
        () => {
          if (isPlayQueueItem(nextTrack)) {
            return ({ duration: nextTrack.track.duration, isPlaying: true, position: 0 });
          }
          return ({ duration: 0, isPlaying: true, position: 0 });
        },
      );
      setDisableNext(false);
    }
  }, [
    handleRepeat,
    nextTrack,
    nowPlaying,
    player,
    playerState,
    queryClient,
    queueId,
    updateTimeline,
  ]);

  const handlePrev = useCallback(async () => {
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
        [QueryKeys.PLAYER_STATE],
        () => ({ ...playerState, position: 0 }),
      );
      setDisablePrev(false);
      return;
    }
    // else go to previous track
    if (isPlayQueueItem(nowPlaying)) {
      await handleRepeat('repeat-none');
      await updateTimeline(nowPlaying.id, 'stopped', player.currentPosition(), nowPlaying.track);
      if (isPlayQueueItem(prevTrack)) {
        await updateTimeline(prevTrack.id, 'playing', 0, prevTrack.track);
        player.startTimer(prevTrack);
      }
      await queryClient.refetchQueries([QueryKeys.PLAYQUEUE, queueId]);
      const newQueue = queryClient.getQueryData([QueryKeys.PLAYQUEUE, queueId]);
      player.updateTracks(newQueue, 'prev');
      queryClient.setQueryData(
        [QueryKeys.PLAYER_STATE],
        () => {
          if (isPlayQueueItem(prevTrack)) {
            return ({ ...playerState, duration: prevTrack.track.duration, position: 0 });
          }
          return ({ ...playerState, duration: 0, position: 0 });
        },
      );
      setDisablePrev(false);
    }
  }, [
    handleRepeat,
    nowPlaying,
    player,
    playerState,
    prevTrack,
    queryClient,
    queueId,
    updateTimeline,
  ]);

  const handlePlayPause = useCallback(async () => {
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
        [QueryKeys.PLAYER_STATE],
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
        [QueryKeys.PLAYER_STATE],
        () => ({ ...playerState, isPlaying: true }),
      );
    }
  }, [ctrlPress, nowPlaying, player, playerState, queryClient, updateTimeline]);

  const onEvent = useCallback(async (action: { event: string }) => {
    if (action.event === 'play-pause' && !!nowPlaying) {
      await handlePlayPause();
      return;
    }
    if (action.event === 'prev' && !disablePrev) {
      await handlePrev();
      return;
    }
    if (action.event === 'next' && !disableNext && !!nextTrack) {
      await handleNext();
    }
  }, [
    disableNext,
    disablePrev,
    handleNext,
    handlePlayPause,
    handlePrev,
    nextTrack,
    nowPlaying,
  ]);

  useEffect(() => {
    const removeEventListener = window.electron
      .receive('taskbar-controls', (action) => onEvent(action));
    return () => removeEventListener();
  }, [onEvent]);

  const handleShuffle = async () => {
    if (playQueue?.shuffled) {
      const newQueue = await toggleShuffle('unshuffle');
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
      return;
    }
    const newQueue = await toggleShuffle('shuffle');
    player.updateTracks(newQueue, 'update');
    await updateQueue(newQueue);
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
      <Tooltip
        PopperProps={popperProps}
        placement="top"
        title="Shuffle"
      >
        <span>
          <IconButton
            disableRipple
            disabled={!nowPlaying || !playQueue?.allowShuffle}
            size="small"
            sx={{
              ...iconButtonStyle,
              color: playQueue?.shuffled ? 'primary.main' : 'text.secondary',
              '&:hover': {
                backgroundColor: 'transparent',
                color: playQueue?.shuffled ? 'primary.main' : 'text.primary',
              },
            }}
            onClick={handleShuffle}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiShuffleFill /></SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
      <span style={{ width: 5 }} />
      <Tooltip
        PopperProps={popperProps}
        placement="top"
        title="Previous"
      >
        <span>
          <IconButton
            disableRipple
            disabled={queueId === 0 || disablePrev}
            size="small"
            sx={iconButtonStyle}
            onClick={handlePrev}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><IoPlaySkipBack /></SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
      <Tooltip
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -12],
              },
            },
          ],
        }}
        placement="top"
        title={getPlayText()}
      >
        <span>
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
        </span>
      </Tooltip>
      <Tooltip
        PopperProps={popperProps}
        placement="top"
        title="Next"
      >
        <span>
          <IconButton
            disableRipple
            disabled={queueId === 0 || disableNext || !nextTrack}
            size="small"
            sx={iconButtonStyle}
            onClick={handleNext}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><IoPlaySkipForward /></SvgIcon>
          </IconButton>
        </span>
      </Tooltip>
      <span style={{ width: 5 }} />
      <Tooltip
        PopperProps={popperProps}
        placement="top"
        title="Repeat"
      >
        <span>
          {settings.repeat === 'repeat-none'
            && (
              <IconButton
                disableRipple
                size="small"
                sx={{ ...iconButtonStyle }}
                onClick={() => handleRepeat('repeat-all')}
              >
                <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeat2Fill /></SvgIcon>
              </IconButton>
            )}
          {settings.repeat === 'repeat-all'
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
                onClick={() => handleRepeat('repeat-one')}
              >
                <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeat2Fill /></SvgIcon>
              </IconButton>
            )}
          {settings.repeat === 'repeat-one'
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
                onClick={() => handleRepeat('repeat-none')}
              >
                <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeatOneFill /></SvgIcon>
              </IconButton>
            )}
        </span>
      </Tooltip>
    </Box>
  );
};

export default MediaButtons;
