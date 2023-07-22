import { IconButton, SvgIcon } from '@mui/material';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect } from 'react';
import {
  RiPauseCircleFill,
  RiPlayCircleFill,
  RiStopCircleFill,
} from 'react-icons/ri';
import { PlayQueueItem } from 'api/index';
import { iconButtonStyle } from 'constants/style';
import useKeyPress from 'hooks/useKeyPress';
import useQueue from 'hooks/useQueue';
import { useCurrentQueue } from 'queries/plex-queries';
import { playbackIsPlayingAtom, usePlayerContext } from 'root/Player';
import { queueIdAtom } from 'root/Root';
import { isPlayQueueItem } from 'types/type-guards';

const { platform } = window.electron.getAppInfo();

const PlayPause = () => {
  const ctrlPress = useKeyPress(platform === 'darwin' ? 'Meta' : 'Control');
  const isPlaying = useAtomValue(playbackIsPlayingAtom);
  const player = usePlayerContext();
  const queueId = useAtomValue(queueIdAtom);
  const setIsPlaying = useSetAtom(playbackIsPlayingAtom);
  const { data: playQueue } = useCurrentQueue();
  const { updateTimeline } = useQueue();

  let currentIndex: number;
  let nowPlaying: PlayQueueItem | boolean = false;
  if (playQueue) {
    currentIndex = playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId);
    nowPlaying = playQueue.items[currentIndex];
  }

  const handlePlayPause = useCallback(async () => {
    if (ctrlPress) {
      if (nowPlaying && isPlayQueueItem(nowPlaying)) {
        player.clearTimer();
        await updateTimeline(nowPlaying.id, 'stopped', player.getPosition(), nowPlaying.track);
      }
      player.resetApp();
      return;
    }
    if (isPlaying) {
      player.pause();
      if (isPlayQueueItem(nowPlaying)) {
        player.clearTimer();
        updateTimeline(nowPlaying.id, 'paused', player.getPosition(), nowPlaying.track);
      }
      setIsPlaying(() => false);
    }
    if (!isPlaying) {
      player.play();
      if (isPlayQueueItem(nowPlaying)) {
        updateTimeline(nowPlaying.id, 'playing', player.getPosition(), nowPlaying.track);
        player.startTimer(nowPlaying);
      }
      setIsPlaying(() => true);
    }
  }, [ctrlPress, isPlaying, nowPlaying, player, setIsPlaying, updateTimeline]);

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
        {ctrlPress && (<RiStopCircleFill />)}
        {!ctrlPress && isPlaying && (<RiPauseCircleFill />)}
        {!ctrlPress && !isPlaying && (<RiPlayCircleFill />)}
      </SvgIcon>
    </IconButton>
  );
};

export default PlayPause;
