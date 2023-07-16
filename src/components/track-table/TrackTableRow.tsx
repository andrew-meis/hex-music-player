import { Row } from '@tanstack/react-table';
import React, { useCallback, useEffect } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemProps } from 'react-virtuoso';
import { PlaylistItem, Track } from 'api/index';
import { DragTypes } from 'types/enums';
import { isPlaylistItem, isSmartPlaylistItem, isTrack } from 'types/type-guards';
import styles from './TrackTable.module.scss';

const TrackTableRow: React.FC<ItemProps<PlaylistItem | Track> & {
  compact: boolean,
  isSorted: boolean,
  prevId?: number,
  row: Row<PlaylistItem> | Row<Track>,
  selectedItems: (PlaylistItem | Track)[],
  trackDropFn?: ((droppedItems: PlaylistItem[], prevId?: number) => Promise<void>) | undefined,
  onClick: (event: React.MouseEvent) => void,
  onContextMenu: (e: React.MouseEvent) => void,
  onDragEnd: () => void,
  onDragStart: () => void,
}> = ({
  compact,
  isSorted,
  prevId,
  row,
  selectedItems,
  trackDropFn,
  onClick,
  onContextMenu,
  onDragEnd,
  onDragStart,
  ...props
}) => {
  const { original: item } = row;

  const [, drag, dragPreview] = useDrag({
    item: () => {
      if (selectedItems.map((selected) => selected.id).includes(item.id)) return selectedItems;
      return [item];
    },
    type: (() => {
      switch (true) {
        case isTrack(item):
          return DragTypes.TRACK;
        case isPlaylistItem(item):
          return DragTypes.PLAYLIST_ITEM;
        case isSmartPlaylistItem(item):
          return DragTypes.SMART_PLAYLIST_ITEM;
        default:
          return 'none';
      }
    })(),
  }, [row]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [DragTypes.PLAYLIST_ITEM],
    canDrop: () => !isSorted,
    drop: async (droppedItems: PlaylistItem[]) => {
      if (!trackDropFn) return;
      trackDropFn(droppedItems, prevId);
    },
    collect: (monitor) => ({ isOver: (monitor.isOver() && !monitor.getItem()[0].smart) }),
  }));

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, item]);

  const dragDrop = useCallback((node: any) => {
    drag(drop(node));
  }, [drag, drop]);

  return (
    <tr
      {...props}
      className={[
        styles.row,
        'track-table-row',
      ].join(' ')}
      data-is-over={isOver && !isSorted}
      ref={dragDrop}
      style={{
        height: compact ? 40 : 56,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    />
  );
};

TrackTableRow.defaultProps = {
  prevId: undefined,
  trackDropFn: undefined,
};

export default TrackTableRow;
