import { IconButton, SvgIcon } from '@mui/material';
import { RiShuffleFill } from 'react-icons/ri';
import { PlayQueueItem } from 'api/index';
import { iconButtonStyle } from 'constants/style';
import useQueue from 'hooks/useQueue';
import { useCurrentQueue } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';

const Shuffle = () => {
  const player = usePlayerContext();
  const { data: playQueue } = useCurrentQueue();
  const { toggleShuffle, updateQueue } = useQueue();

  let currentIndex: number;
  let nowPlaying: PlayQueueItem | boolean = false;
  if (playQueue) {
    currentIndex = playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId);
    nowPlaying = playQueue.items[currentIndex];
  }

  const canShuffle = () => {
    if (!nowPlaying) return true;
    if (playQueue && playQueue.allowShuffle !== undefined) {
      return !playQueue.allowShuffle;
    }
    if (playQueue && playQueue.lastAddedItemID !== undefined) {
      return true;
    }
    return false;
  };

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
    <IconButton
      disableRipple
      disabled={canShuffle()}
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
  );
};

export default Shuffle;
