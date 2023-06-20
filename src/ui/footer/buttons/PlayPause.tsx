import { IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import {
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiStopCircleFill,
} from 'react-icons/all';
import { PlayQueueItem } from 'api/index';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import useKeyPress from 'hooks/useKeyPress';
import useQueue from 'hooks/useQueue';
import { useQueueId } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { QueryKeys } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';

const { platform } = window.electron.getAppInfo();

const PlayPause = () => {
  const ctrlPress = useKeyPress(platform === 'darwin' ? 'Meta' : 'Control');
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const { data: playerState } = usePlayerState();
  const { data: playQueue } = useCurrentQueue();
  const { updateTimeline } = useQueue();

  let currentIndex: number;
  let nowPlaying: PlayQueueItem | boolean = false;
  if (playQueue) {
    currentIndex = playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId);
    nowPlaying = playQueue.items[currentIndex];
  }

  useEffect(() => {
    if (!!nowPlaying && ctrlPress) {
      setText('Stop');
      return;
    }
    if (playerState.isPlaying) {
      setText('Pause');
      return;
    }
    setText('Play');
  }, [ctrlPress, nowPlaying, playerState.isPlaying]);

  const handleClose = () => {
    setOpen(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handlePlayPause = useCallback(async () => {
    if (ctrlPress) {
      if (nowPlaying && isPlayQueueItem(nowPlaying)) {
        player.clearTimer();
        await updateTimeline(nowPlaying.id, 'stopped', player.getPosition(), nowPlaying.track);
      }
      player.resetApp();
      return;
    }
    if (playerState.isPlaying) {
      player.pause();
      if (isPlayQueueItem(nowPlaying)) {
        player.clearTimer();
        updateTimeline(nowPlaying.id, 'paused', player.getPosition(), nowPlaying.track);
      }
      queryClient.setQueryData(
        [QueryKeys.PLAYER_STATE],
        () => ({ ...playerState, isPlaying: false }),
      );
    }
    if (!playerState.isPlaying) {
      player.play();
      if (isPlayQueueItem(nowPlaying)) {
        updateTimeline(nowPlaying.id, 'playing', player.getPosition(), nowPlaying.track);
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
    }
  }, [handlePlayPause, nowPlaying]);

  useEffect(() => {
    const removeEventListener = window.electron
      .receive('taskbar-controls', (action) => onEvent(action));
    return () => removeEventListener();
  }, [onEvent]);

  return (
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
      open={open}
      placement="top"
      title={text}
      onClose={handleClose}
      onOpen={handleOpen}
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
            {!!nowPlaying && ctrlPress && (<RiStopCircleFill />)}
            {!ctrlPress && playerState.isPlaying && (<RiPauseCircleFill />)}
            {!ctrlPress && !playerState.isPlaying && (<RiPlayCircleFill />)}
          </SvgIcon>
        </IconButton>
      </span>
    </Tooltip>
  );
};

export default PlayPause;
