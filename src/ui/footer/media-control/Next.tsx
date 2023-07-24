import { IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import { useCallback, useEffect, useState } from 'react';
import { IoPlaySkipForward } from 'react-icons/io5';
import { PlayQueue, PlayQueueItem } from 'api/index';
import { iconButtonStyle } from 'constants/style';
import useQueue from 'hooks/useQueue';
import { useCurrentQueue } from 'queries/plex-queries';
import { playbackDurationAtom, playbackIsPlayingAtom, usePlayerContext } from 'root/Player';
import { queueIdAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';

interface NextProps {
  handleRepeat: (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => void;
}

const Next = ({ handleRepeat }: NextProps) => {
  const isPlaying = useAtomValue(playbackIsPlayingAtom);
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useAtomValue(queueIdAtom);
  const setDuration = useSetAtom(playbackDurationAtom);
  const setIsPlaying = useSetAtom(playbackIsPlayingAtom);
  const [disableNext, setDisableNext] = useState(false);
  const { data: playQueue } = useCurrentQueue();
  const { updateTimeline } = useQueue();

  let currentIndex: number;
  let nowPlaying: PlayQueueItem | boolean = false;
  let nextTrack: PlayQueueItem | boolean = false;
  if (playQueue) {
    currentIndex = playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId);
    nowPlaying = playQueue.items[currentIndex];
    nextTrack = playQueue.items[currentIndex + 1];
  }

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
      if (isPlayQueueItem(nextTrack)) {
        player.applyTrackGain(nextTrack.track);
      }
      player.next();
      if (!isPlaying) {
        player.play();
      }
      player.updateTracks(newQueue as PlayQueue, 'next');
      setDuration(() => {
        if (isPlayQueueItem(nextTrack)) {
          return nextTrack.track.duration;
        }
        return 0;
      });
      setIsPlaying(() => true);
      setDisableNext(false);
    }
  }, [
    handleRepeat,
    isPlaying,
    nextTrack,
    nowPlaying,
    player,
    queryClient,
    queueId,
    setDuration,
    setIsPlaying,
    updateTimeline,
  ]);

  const onEvent = useCallback(async (action: { event: string }) => {
    if (action.event === 'next' && !disableNext && !!nextTrack) {
      await handleNext();
    }
  }, [disableNext, handleNext, nextTrack]);

  useEffect(() => {
    const removeEventListener = window.electron
      .receive('taskbar-controls', (action) => onEvent(action));
    return () => removeEventListener();
  }, [onEvent]);

  return (
    <IconButton
      disableRipple
      disabled={queueId === 0 || disableNext || !nextTrack}
      size="small"
      sx={iconButtonStyle}
      onClick={handleNext}
    >
      <SvgIcon sx={{ width: '0.9em', height: '1em' }}><IoPlaySkipForward /></SvgIcon>
    </IconButton>
  );
};

export default Next;
