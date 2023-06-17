import { IconButton, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useEffect, useState } from 'react';
import { IoPlaySkipBack } from 'react-icons/all';
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

interface PreviousProps {
  handleRepeat: (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => Promise<void>;
}

const Previous = ({ handleRepeat }: PreviousProps) => {
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const [disablePrev, setDisablePrev] = useState(false);
  const { data: playerState } = usePlayerState();
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
          playerState.position,
          nowPlaying.track,
        );
      }
      const { trackNumber } = player.playlist!;
      player.cue();
      player.playlist!.trackNumber = trackNumber;
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
      player.updateTracks(newQueue as PlayQueue, 'prev');
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
  );
};

export default Previous;
