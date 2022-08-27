import React from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { isAlbum, isArtist, isPlayListItem, isPlayQueueItem, isTrack } from '../types/type-guards';

const layerStyles: React.CSSProperties = {
  position: 'fixed',
  pointerEvents: 'none',
  zIndex: 10000,
  left: 0,
  top: 0,
  width: '100vw',
  height: '100vh',
};

const getItemStyles = (
  initialCursorOffset: XYCoord | null,
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) => {
  if (!initialOffset || !currentOffset || !initialCursorOffset) {
    return {
      display: 'none',
    };
  }

  const x = initialCursorOffset.x + (currentOffset.x - initialOffset.x);
  const y = initialCursorOffset.y + (currentOffset.y - initialOffset.y);
  const transform = `translate(${x}px, ${y}px)`;

  return {
    transform,
    background: 'tomato',
    width: 'fit-content',
    opacity: 0.7,
    lineHeight: '1.5rem',
    borderRadius: '4px',
    padding: '6px',
  };
};

const getText = (item: any) => {
  if (Array.isArray(item) && item.length > 1) {
    return `${item.length} items`;
  }
  if (isArtist(item)) {
    return `${item.title}`;
  }
  if (isAlbum(item)) {
    return `${item.title} — ${item.parentTitle}`;
  }
  if (isPlayListItem(item)) {
    return `${item.track.title} — ${item.track.originalTitle || item.track.grandparentTitle}`;
  }
  if (isPlayQueueItem(item)) {
    return `${item.track.title} — ${item.track.originalTitle || item.track.grandparentTitle}`;
  }
  if (isTrack(item)) {
    return `${item.title} — ${item.originalTitle || item.grandparentTitle}`;
  }
  return '';
};

const DragLayer = () => {
  const {
    item,
    itemType,
    isDragging,
    initialCursorOffset,
    initialFileOffset,
    currentFileOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialCursorOffset: monitor.getInitialClientOffset(),
    initialFileOffset: monitor.getInitialSourceClientOffset(),
    currentFileOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(
          initialCursorOffset,
          initialFileOffset,
          currentFileOffset,
        )}
      >
        <div>{getText(item)}</div>
      </div>
    </div>
  );
};

export default DragLayer;
