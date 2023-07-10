import { Row } from '@tanstack/react-table';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { ItemProps } from 'react-virtuoso';
import { Track } from 'api/index';
import { DragTypes } from 'types/enums';
import styles from './TrackTable.module.scss';

const TrackTableRow: React.FC<ItemProps<Track> & {
  compact: boolean,
  row: Row<Track>,
  selectedTracks: Track[],
  onClick: (event: React.MouseEvent) => void,
  onContextMenu: (e: React.MouseEvent) => void,
  onDragEnd: () => void,
  onDragStart: () => void,
}> = ({
  compact,
  row,
  selectedTracks,
  onClick,
  onContextMenu,
  onDragEnd,
  onDragStart,
  ...props
}) => {
  const { original: track } = row;

  const [, drag, dragPreview] = useDrag({
    item: () => {
      if (selectedTracks.map((selected) => selected.id).includes(track.id)) return selectedTracks;
      return [track];
    },
    type: DragTypes.TRACK,
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, track]);

  return (
    <tr
      {...props}
      className={[
        styles.row,
        row.getIsSelected() ? styles['row-selected'] : null,
        'track-table-row',
      ].join(' ')}
      data-track-id={row.getIsGrouped() ? null : track.id}
      ref={drag}
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

export default TrackTableRow;
