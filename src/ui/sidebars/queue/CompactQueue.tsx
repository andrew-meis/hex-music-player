import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import { isNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useMeasure } from 'react-use';
import useDragActions from 'hooks/useDragActions';
import { useLibrary } from 'queries/app-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import 'styles/queue.scss';
import { DragActions } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';

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
        className="compact-queue"
        data-index={index}
        sx={{
          borderRadius: '4px',
          borderTop: over ? '1px solid var(--mui-palette-info-main)' : '1px solid transparent',
          marginRight: '3px',
        }}
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
          sx={{ width: 40, height: 40, mb: '2px', ml: '3px', mt: '2px', pointerEvents: 'none' }}
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
  const { addLast, addMany, addOne, moveLast, moveTrack } = useDragActions();
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
    index: number | null,
    item: unknown,
    itemType: null | string | symbol,
  ) => {
    if (!items || typeof index !== 'number') {
      return;
    }
    const target = items[index];
    if (itemType === DragActions.COPY_TRACK) {
      if (target) {
        const prevId = getPrevId(target.id);
        await addOne(item as Track, prevId as number);
        return;
      }
      if (!target) {
        await addLast(item as Track);
        return;
      }
    }
    if (itemType === DragActions.COPY_TRACKS) {
      if (Array.isArray(item) && target) {
        const prevId = getPrevId(target.id);
        await addMany(item as Track[], prevId as number);
      }
      if (Array.isArray(item) && !target) {
        await addLast(item as Track[]);
      }
    }
    if (itemType === DragActions.MOVE_TRACK) {
      if (isPlayQueueItem(item) && target) {
        const currentPrevId = getPrevId(item.id);
        const newPrevId = getPrevId(target.id);
        if (currentPrevId === newPrevId) {
          return;
        }
        await moveTrack(item.id, newPrevId as number);
        return;
      }
      if (isPlayQueueItem(item) && !target) {
        await moveLast(item);
      }
    }
  }, [addLast, addMany, addOne, getPrevId, items, moveLast, moveTrack]);

  const [, drop] = useDrop(() => ({
    accept: [
      DragActions.COPY_TRACK,
      DragActions.COPY_TRACKS,
      DragActions.MOVE_TRACK,
    ],
    drop: (
      item: PlayQueueItem | Track | Track[],
      monitor,
    ) => handleDrop(dropIndex.current, item, monitor.getItemType()),
  }), [items, playQueue]);

  const [{ isDragging }, drag, dragPreview] = useDrag(() => ({
    type: DragActions.MOVE_TRACK,
    item: () => {
      if (items && isNumber(hoverIndex.current)) {
        return items[hoverIndex.current];
      }
      return undefined;
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
