import { IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { IoPlaySkipForward } from 'react-icons/all';
import { PlayQueue, PlayQueueItem } from 'api/index';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import useQueue from 'hooks/useQueue';
import { useQueueId } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { QueryKeys } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';

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

interface NextProps {
  handleRepeat: (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => Promise<void>;
}

const Next = ({ handleRepeat }: NextProps) => {
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const [disableNext, setDisableNext] = useState(false);
  const { data: playerState } = usePlayerState();
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
      if (!playerState.isPlaying) {
        player.play();
      }
      player.updateTracks(newQueue as PlayQueue, 'next');
      queryClient.setQueryData(
        [QueryKeys.PLAYER_STATE],
        () => {
          if (isPlayQueueItem(nextTrack)) {
            return ({ duration: nextTrack.track.duration, isPlaying: true });
          }
          return ({ duration: 0, isPlaying: true });
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
  );
};

export default Next;
