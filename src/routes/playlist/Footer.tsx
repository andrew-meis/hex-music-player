import React from 'react';
import { useDrop } from 'react-dnd';
import { PlaylistItem } from 'api/index';
import { DragTypes } from 'types/enums';

const Footer: React.FC<{
  isSorted: boolean,
  trackDropFn: ((droppedItems: PlaylistItem[], prevId?: number) => Promise<void>) | undefined,
}> = ({ isSorted, trackDropFn }) => {
  const [{ isOver }, drop] = useDrop(() => ({
    accept: [DragTypes.PLAYLIST_ITEM],
    canDrop: () => !isSorted,
    drop: async (droppedItems: PlaylistItem[]) => {
      if (!trackDropFn) return;
      trackDropFn(droppedItems, Infinity);
    },
    collect: (monitor) => ({ isOver: (monitor.isOver() && !monitor.getItem()[0].smart) }),
  }));

  return (
    <tr
      ref={drop}
    >
      <td
        colSpan={100}
        style={{
          borderTop: '1px solid',
          borderTopColor: isOver && !isSorted
            ? 'var(--mui-palette-primary-main)'
            : 'var(--mui-palette-border-main)',
          height: 30,
        }}
      />
    </tr>
  );
};

export default Footer;
