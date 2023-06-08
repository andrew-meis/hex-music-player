import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { isNumber } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useMeasure } from 'react-use';
import { Library, PlaylistItem, PlayQueueItem, Track } from 'api/index';
import QueueMenu from 'components/menus/QueueMenu';
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
  onContextMenu: (event: any) => void;
  onDrop: () => void;
  onMouseEnter: () => void;
}

const Text = ({ track }: { track: Track }) => (
  <Typography color="common.white" textAlign="center">
    {`${track.originalTitle || track.grandparentTitle} — ${track.title}`}
  </Typography>
);

const Item = (
  {
    index, isDragging, item, library, onContextMenu, onDrop, onMouseEnter,
  } : ItemProps,
) => {
  const [open, setOpen] = useState(false);
  const [over, setOver] = useState(false);

  const handleDrop = () => {
    onDrop();
    setOver(false);
  };

  const handleOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <Tooltip
      arrow
      TransitionProps={{
        timeout: isDragging ? 0 : 150,
      }}
      key={item.id}
      open={open}
      placement="left"
      title={isDragging ? '' : <Text track={item.track} />}
      onClose={handleClose}
      onOpen={handleOpen}
    >
      <Box
        borderTop={over ? '1px solid var(--mui-palette-primary-main)' : '1px solid transparent'}
        className="compact-queue"
        data-index={index}
        onContextMenu={(event) => {
          setOpen(false);
          onContextMenu(event);
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
          sx={{ mb: '2px', mt: '2px', pointerEvents: 'none' }}
          variant="rounded"
        />
      </Box>
    </Tooltip>
  );
};

const CompactQueue = () => {
  const contextMenuItems = useRef<PlayQueueItem[]>([]);
  const dropIndex = useRef<number | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuProps, toggleMenu] = useMenuState({ transition: true });
  const [ref, { height }] = useMeasure();
  const { addLast, addMany, moveMany, moveManyLast, removeMany } = useDragActions();
  const { data: playQueue } = useCurrentQueue();

  const maxListLength = Math.ceil(height / 46);
  const items = useMemo(() => playQueue?.items
    .slice(playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId) + 1)
    .slice(0, maxListLength), [maxListLength, playQueue]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-index');
    if (!target || !items) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    contextMenuItems.current = [items[targetIndex]];
    menuRef.current = event.currentTarget;
    toggleMenu(true);
  }, [items, toggleMenu]);

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
    /** MOVE PLAYQUEUE ITEMS WITHIN QUEUE */
    if (itemType === DragTypes.PLAYQUEUE_ITEM && target) {
      const moveIds = array.map((queueItem) => queueItem.id);
      const prevId = getPrevId(target.id);
      await moveMany(moveIds, prevId as number);
      return;
    }
    /** MOVE PLAYQUEUE ITEMS TO END OF QUEUE */
    if (itemType === DragTypes.PLAYQUEUE_ITEM && !target) {
      await moveManyLast(array);
      return;
    }
    /** ADD OTHER ITEMS WITHIN QUEUE */
    if (target) {
      const prevId = getPrevId(target.id);
      await addMany(tracks as Track[], prevId as number);
      return;
    }
    /** ADD OTHER ITEMS TO END OF QUEUE */
    if (!target) {
      await addLast(tracks as Track[]);
    }
  }, [addLast, addMany, getPrevId, items, moveMany, moveManyLast]);

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

  const removeTracks = useCallback(async (itemsToRemove: PlayQueueItem[]) => {
    await removeMany(itemsToRemove);
  }, [removeMany]);

  if (!items) {
    return null;
  }

  return (
    <Box
      height="calc(100% - 4px)"
      ml="9px"
      ref={ref}
      width={42}
    >
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
            onContextMenu={(event) => handleContextMenu(event)}
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
          onDrop={() => {
            dropIndex.current = Infinity;
          }}
          onMouseEnter={() => {
            hoverIndex.current = null;
          }}
        />
      </Box>
      <QueueMenu
        arrow
        align="center"
        anchorRef={menuRef}
        currentId={playQueue?.selectedItemId}
        direction="left"
        items={contextMenuItems.current}
        removeTracks={removeTracks}
        toggleMenu={toggleMenu}
        onClose={() => {
          contextMenuItems.current = [];
          toggleMenu(false);
        }}
        {...menuProps}
      />
    </Box>
  );
};

export default CompactQueue;
