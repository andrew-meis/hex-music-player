import { Box } from '@mui/material';
import { useDrop } from 'react-dnd';
import { PlaylistItem, PlayQueueItem, Track } from 'api/index';
import { WIDTH_CALC } from 'constants/measures';
import { DragTypes } from 'types/enums';
import { PlaylistContext } from './Playlist';

const Footer = ({ context }: { context?: PlaylistContext | undefined }) => {
  const dragType = document.getElementById('playlist-box')?.getAttribute('data-drag-type');
  const { handleDrop, items, playlist } = context!;
  const [, drop] = useDrop(() => ({
    accept: [
      DragTypes.PLAYLIST_ITEM,
    ],
    drop: (
      item: PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => handleDrop(item, Infinity, monitor.getItemType()),
  }), [items]);

  return (
    <Box
      className="playlist-footer"
      data-smart={playlist?.smart}
      height="30px"
      maxWidth={900}
      mx="auto"
      ref={playlist?.smart ? null : drop}
      width={WIDTH_CALC}
      onDragEnter={() => {
        if (dragType !== 'playlist-item') return;
        document.querySelector('.playlist-footer')
          ?.classList.add('playlist-footer-over');
      }}
      onDragLeave={() => {
        if (dragType !== 'playlist-item') return;
        document.querySelector('.playlist-footer')
          ?.classList.remove('playlist-footer-over');
      }}
      onDrop={() => {
        if (dragType !== 'playlist-item') return;
        document.querySelector('.playlist-footer')
          ?.classList.remove('playlist-footer-over');
      }}
    />
  );
};

Footer.defaultProps = {
  context: undefined,
};

export default Footer;
