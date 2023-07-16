import { IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { IoPlaySkipBack } from 'react-icons/io5';
import { PlayQueue, PlayQueueItem } from 'api/index';
import { iconButtonStyle } from 'constants/style';
import useQueue from 'hooks/useQueue';
import { useQueueId } from 'queries/app-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import { playbackDurationAtom, playbackIsPlayingAtom, usePlayerContext } from 'root/Player';
import { QueryKeys } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';

interface PreviousProps {
  handleRepeat: (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => Promise<void>;
}

const Previous = ({ handleRepeat }: PreviousProps) => {
  const isPlaying = useAtomValue(playbackIsPlayingAtom);
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const setDuration = useSetAtom(playbackDurationAtom);
  const [disablePrev, setDisablePrev] = useState(false);
  const { data: playQueue } = useCurrentQueue();
  const { updateTimeline } = useQueue();

  let currentIndex: number;
  let nowPlaying: PlayQueueItem | boolean = false;
  let prevTrack: PlayQueueItem | boolean = false;
  if (playQueue) {
    currentIndex = playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId);
    nowPlaying = playQueue.items[currentIndex];
    prevTrack = playQueue.items[currentIndex - 1];
  }

  const handlePrev = useCallback(async () => {
    setDisablePrev(true);
    // cue current track if no previous track or more than five seconds have elapsed
    if (!prevTrack || player.currentPosition() > 5000) {
      if (isPlayQueueItem(nowPlaying)) {
        await updateTimeline(
          nowPlaying.id,
          'stopped',
          player.getPosition(),
          nowPlaying.track,
        );
      }
      const { trackNumber } = player.playlist!;
      player.cue();
      player.playlist!.trackNumber = trackNumber;
      if (!isPlaying) {
        player.pause();
      }
      if (isPlayQueueItem(nowPlaying)) {
        await updateTimeline(
          nowPlaying.id,
          isPlaying ? 'playing' : 'paused',
          0,
          nowPlaying.track,
        );
      }
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
      player.updateTracks(newQueue as PlayQueue, 'prev');
      setDuration(() => {
        if (isPlayQueueItem(prevTrack)) {
          return prevTrack.track.duration;
        }
        return 0;
      });
      setDisablePrev(false);
    }
  }, [
    handleRepeat,
    isPlaying,
    nowPlaying,
    player,
    prevTrack,
    queryClient,
    queueId,
    setDuration,
    updateTimeline,
  ]);

  const onEvent = useCallback(async (action: { event: string }) => {
    if (action.event === 'prev' && !disablePrev) {
      await handlePrev();
    }
  }, [disablePrev, handlePrev]);

  useEffect(() => {
    const removeEventListener = window.electron
      .receive('taskbar-controls', (action) => onEvent(action));
    return () => removeEventListener();
  }, [onEvent]);

  return (
    <IconButton
      disableRipple
      disabled={queueId === 0 || disablePrev}
      size="small"
      sx={iconButtonStyle}
      onClick={handlePrev}
    >
      <SvgIcon sx={{ width: '0.9em', height: '1em' }}><IoPlaySkipBack /></SvgIcon>
    </IconButton>
  );
};

export default Previous;
