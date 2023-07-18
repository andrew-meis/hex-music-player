import { Row } from '@tanstack/react-table';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { Track } from 'api/index';
import { DragTypes } from 'types/enums';
import styles from './TrackTable.module.scss';

const TrackTableRowStatic: React.FC<{
  children: React.ReactNode,
  compact: boolean,
  next?: Row<Track>,
  prev?: Row<Track>,
  row: Row<Track>,
  selectedItems: Track[],
  onClick: (event: React.MouseEvent) => void,
  onContextMenu: (e: React.MouseEvent) => void,
  onDragEnd: () => void,
  onDragStart: () => void,
}> = ({
  children,
  compact,
  next,
  prev,
  row,
  selectedItems,
  onClick,
  onContextMenu,
  onDragEnd,
  onDragStart,
}) => {
  const { original: item } = row;

  const [, drag, dragPreview] = useDrag({
    item: () => {
      if (selectedItems.map((selected) => selected.id).includes(item.id)) return selectedItems;
      return [item];
    },
    type: DragTypes.TRACK,
  }, [row, selectedItems]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, item]);

  return (
    <tr
      className={[
        styles.row,
        'track-table-row',
      ].join(' ')}
      data-row-id={row.original.id}
      data-selected={row.getIsSelected()}
      data-selected-above={prev?.getIsSelected() || false}
      data-selected-below={next?.getIsSelected() || false}
      ref={drag}
      style={{
        height: compact ? 40 : 56,
      }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      onDragEnd={onDragEnd}
      onDragStart={onDragStart}
    >
      {children}
    </tr>
  );
};

TrackTableRowStatic.defaultProps = {
  next: undefined,
  prev: undefined,
};

export default TrackTableRowStatic;
