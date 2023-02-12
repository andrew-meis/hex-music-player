import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef } from 'react';
import { useDragLayer, XYCoord } from 'react-dnd';
import { isAlbum, isArtist, isPlayListItem, isPlayQueueItem, isTrack } from 'types/type-guards';

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
  currentCursorOffset: XYCoord | null,
  initialOffset: XYCoord | null,
  currentOffset: XYCoord | null,
) => {
  if (!initialOffset || !currentOffset || !initialCursorOffset || !currentCursorOffset) {
    return {
      display: 'none',
    };
  }

  const translate = Math.floor((currentCursorOffset.x / window.innerWidth) * 100);
  const x = initialCursorOffset.x + (currentOffset.x - initialOffset.x);
  const y = initialCursorOffset.y + (currentOffset.y - initialOffset.y);
  const transform = `translateX(-${translate}%) translate(${x}px, ${y}px)`;

  return {
    transform,
    background: 'var(--mui-palette-info-main)',
    width: 'fit-content',
    opacity: 0.8,
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
  const queryClient = useQueryClient();
  const isDraggingRef = useRef(false);
  const {
    item,
    // itemType,
    isDragging,
    initialCursorOffset,
    currentCursorOffset,
    initialFileOffset,
    currentFileOffset,
  } = useDragLayer((monitor) => ({
    item: monitor.getItem(),
    itemType: monitor.getItemType(),
    initialCursorOffset: monitor.getInitialClientOffset(),
    currentCursorOffset: monitor.getClientOffset(),
    initialFileOffset: monitor.getInitialSourceClientOffset(),
    currentFileOffset: monitor.getSourceClientOffset(),
    isDragging: monitor.isDragging(),
  }));

  useEffect(() => {
    if (isDragging === isDraggingRef.current) return;
    queryClient.setQueryData(['is-dragging'], isDragging);
    isDraggingRef.current = isDragging;
  }, [isDragging, queryClient]);

  if (!isDragging) {
    return null;
  }

  return (
    <div style={layerStyles}>
      <div
        style={getItemStyles(
          initialCursorOffset,
          currentCursorOffset,
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
