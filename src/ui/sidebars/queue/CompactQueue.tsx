import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { Library, PlaylistItem, PlayQueueItem, Track } from 'hex-plex';
import { isNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useMeasure } from 'react-use';
import useDragActions from 'hooks/useDragActions';
import { useLibrary } from 'queries/app-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import 'styles/queue.scss';
import { DragTypes } from 'types/enums';

interface ItemProps {
  index: number;
  isDragging: boolean;
  item: PlayQueueItem;
  library: Library;
  onDrop: () => void;
  onMouseEnter: () => void;
}

const Text = ({ track }: { track: Track }) => (
  <Typography color="common.white" textAlign="center">
    {`${track.originalTitle || track.grandparentTitle} — ${track.title}`}
  </Typography>
);

const Item = ({ index, isDragging, item, library, onDrop, onMouseEnter } : ItemProps) => {
  const [over, setOver] = useState(false);
  const handleDrop = () => {
    onDrop();
    setOver(false);
  };

  return (
    <Tooltip
      arrow
      TransitionProps={{
        timeout: isDragging ? 0 : 150,
      }}
      key={item.id}
      placement="left"
      title={isDragging ? '' : <Text track={item.track} />}
    >
      <Box
        borderTop={over ? '1px solid var(--mui-palette-info-main)' : '1px solid transparent'}
        className="compact-queue"
        data-index={index}
        marginX="auto"
        onDragEnter={() => setOver(true)}
        onDragLeave={() => setOver(false)}
        onDrop={handleDrop}
        onMouseEnter={onMouseEnter}
      >
        <Avatar
          alt={item.track.title}
          src={library.api.getAuthenticatedUrl(
            '/photo/:/transcode',
            {
              url: item.track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
            },
          )}
          sx={{ mb: '2px', mt: '2px', pointerEvents: 'none' }}
          variant="rounded"
        />
      </Box>
    </Tooltip>
  );
};

const CompactQueue = () => {
  const dropIndex = useRef<number | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const [ref, { height }] = useMeasure();
  const { addLast, addMany, moveLast, moveMany } = useDragActions();
  const { data: playQueue } = useCurrentQueue();

  const maxListLength = Math.ceil(height / 46);
  const items = useMemo(() => playQueue?.items
    .slice(playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId) + 1)
    .slice(0, maxListLength), [maxListLength, playQueue]);

  const getPrevId = useCallback((itemId: PlayQueueItem['id']): PlayQueueItem['id'] | undefined => {
    if (playQueue) {
      const index = playQueue.items.findIndex((item) => item.id === itemId);
      return playQueue.items[index - 1].id;
    }
    return undefined;
  }, [playQueue]);

  const handleDrop = useCallback(async (
    array: any[],
    index: number | null,
    itemType: null | string | symbol,
  ) => {
    if (!items || typeof index !== 'number') {
      return;
    }
    const target = items[index];
    let tracks;
    if (itemType === DragTypes.PLAYLIST_ITEM) {
      tracks = array.map((item) => item.track) as Track[];
    } else {
      tracks = array as Track[];
    }
    if (itemType === DragTypes.PLAYQUEUE_ITEM && target) {
      const moveIds = array.map((queueItem) => queueItem.id);
      const prevId = getPrevId(target.id);
      await moveMany(moveIds, prevId as number);
      return;
    }
    if (itemType === DragTypes.PLAYQUEUE_ITEM && !target) {
      array.forEach(async (queueItem) => {
        await moveLast(queueItem);
      });
      return;
    }
    if (target) {
      const prevId = getPrevId(target.id);
      await addMany(tracks as Track[], prevId as number);
      return;
    }
    if (!target) {
      await addLast(tracks as Track[]);
    }
  }, [addLast, addMany, getPrevId, items, moveLast, moveMany]);

  const [, drop] = useDrop(() => ({
    accept: [
      DragTypes.PLAYLIST_ITEM,
      DragTypes.PLAYQUEUE_ITEM,
      DragTypes.TRACK,
    ],
    drop: (
      item: PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => handleDrop(item, dropIndex.current, monitor.getItemType()),
  }), [items, playQueue]);

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.PLAYQUEUE_ITEM,
    item: () => {
      if (items && isNumber(hoverIndex.current)) {
        return [items[hoverIndex.current]];
      }
      return [];
    },
    collect: ((monitor) => ({
      isDragging: monitor.isDragging(),
    })),
  }), [items]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview]);

  const handleDrag = useCallback((node: any) => {
    drag(drop(node));
  }, [drag, drop]);

  if (!items) {
    return null;
  }

  return (
    <Box display="flex" flexDirection="column" height="calc(100% - 4px)" ref={ref} width="48px">
      <Box
        display="flex"
        flexDirection="column"
        height={1}
        overflow="hidden"
        ref={handleDrag}
      >
        {items.map((item, index) => (
          <Item
            index={index}
            isDragging={isDragging}
            item={item}
            key={item.id}
            library={library}
            onDrop={() => {
              dropIndex.current = index;
            }}
            onMouseEnter={() => {
              hoverIndex.current = index;
            }}
          />
        ))}
        <Box
          bottom={4}
          height={`calc(100% - ${(maxListLength - 1) * 46}px)`}
          position="absolute"
          sx={{
            background: `linear-gradient(to top, rgba(255,255,255, 0.04) 20%, transparent),
              linear-gradient(to top, var(--mui-palette-background-paper) 20%, transparent)`,
          }}
          width={48}
          onMouseEnter={() => {
            hoverIndex.current = null;
          }}
        />
      </Box>
    </Box>
  );
};

export default CompactQueue;
