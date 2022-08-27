import { Avatar, Box, ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDrag, useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { FiMoreHorizontal, RiCloseFill } from 'react-icons/all';
import { useMeasure } from 'react-use';
import { Virtuoso } from 'react-virtuoso';
import styles from 'styles/Queue.module.scss';
import Subtext from '../../../components/subtext/Subtext';
import { usePlayerContext } from '../../../core/Player';
import { useCurrentQueue, useLibrary, useSettings } from '../../../hooks/queryHooks';
import useDragActions from '../../../hooks/useDragActions';
import usePlayback from '../../../hooks/usePlayback';
import useQueue from '../../../hooks/useQueue';
import useRowSelect from '../../../hooks/useRowSelect';
import { DragActions } from '../../../types/enums';
import { isPlayQueueItem } from '../../../types/type-guards';

const itemStyle = {
  color: 'text.secondary',
  '&:hover': {
    borderRadius: '4px',
    color: 'text.primary',
    backgroundColor: 'action.hover',
  },
};

const previewOptions = {
  offsetX: -8,
};

const selectBorderRadius = (selUp: boolean, selDown: boolean) => {
  if (selUp && selDown) {
    return '0';
  }
  if (selUp) {
    return '0 0 4px 4px';
  }
  if (selDown) {
    return '4px 4px 0 0';
  }
  return '4px';
};

const selectedStyle = {
  ...itemStyle,
  backgroundColor: 'action.selected',
  color: 'text.primary',
  '&:hover': {
    backgroundColor: 'action.selected',
  },
};

const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};

export interface UpcomingTracksContext {
  dropIndex: React.MutableRefObject<number | null>;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  library: Library;
  items: PlayQueueItem[] | undefined;
  playQueueItem: (item: PlayQueueItem) => Promise<void>;
  removeTrack: (item: PlayQueueItem) => Promise<void>;
  selectedRows: number[];
}

export interface RowProps {
  index: number;
  item: PlayQueueItem;
  context: UpcomingTracksContext;
}

const Row = React.memo(({ index, item, context }: RowProps) => {
  const box = useRef<HTMLDivElement | null>(null);
  const {
    dropIndex,
    handleRowClick,
    hoverIndex,
    library,
    playQueueItem,
    removeTrack,
    selectedRows,
  } = context;
  const { track } = item;
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
    },
  );

  const selected = selectedRows.includes(index);
  const selUp = selected && selectedRows.includes(index - 1);
  const selDown = selected && selectedRows.includes(index + 1);

  const handleDoubleClick = async () => {
    await playQueueItem(item);
  };

  const handleDrop = () => {
    box.current?.classList.remove(styles['single-track-over']);
    dropIndex.current = index;
  };

  const handleMouseEnter = () => {
    hoverIndex.current = index;
  };

  if (!track) {
    return null;
  }

  return (
    <Box
      alignItems="center"
      className={styles['single-track']}
      display="flex"
      height={54}
      ref={box}
      sx={selected
        ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
        : { ...itemStyle }}
      onClick={(event) => handleRowClick(event, index)}
      onDoubleClick={handleDoubleClick}
      onDragEnter={() => {
        box.current?.classList.add(styles['single-track-over']);
      }}
      onDragLeave={() => {
        box.current?.classList.remove(styles['single-track-over']);
      }}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
    >
      <Avatar
        alt={track.title}
        src={thumbSrc}
        sx={{ width: 40, height: 40, marginX: '8px' }}
        variant="rounded"
      />
      <Box
        sx={{
          display: 'table',
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <Typography
          color="text.primary"
          fontFamily="Rubik"
          fontSize="0.95rem"
          sx={{ ...typographyStyle }}
        >
          {track.title}
        </Typography>
        <Typography
          color="text.secondary"
          fontSize="0.875rem"
          sx={{ ...typographyStyle }}
        >
          <Subtext showAlbum track={track} />
        </Typography>
      </Box>
      <Box title="Remove from queue">
        <SvgIcon
          sx={{
            mx: '6px',
            color: 'text.primary',
            width: '0.9em',
            height: '0.9em',
            transition: 'transform 200ms ease-in-out',
            '&:hover': {
              color: 'error.main',
              transform: 'scale(1.3)',
            },
          }}
          onClick={() => removeTrack(item)}
        >
          <RiCloseFill />
        </SvgIcon>
      </Box>
    </Box>
  );
});

const RowContent = (props: RowProps) => <Row {...props} />;

// TODO add moveManyLast
const UpcomingTracksVirtuoso = () => {
  const box = useRef<HTMLDivElement | null>(null);
  const dropIndex = useRef<number | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const player = usePlayerContext();
  const [ref, { height }] = useMeasure();
  const { addLast, addMany, addOne, moveLast, moveMany, moveTrack } = useDragActions();
  const { data: playQueue } = useCurrentQueue();
  const { data: settings } = useSettings();
  const { playQueueItem } = usePlayback();
  const { removeFromQueue, updateQueue } = useQueue();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const maxListLength = Math.floor(height / 56);
  const items = playQueue?.items
    .slice(playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId) + 1)
    .slice(0, maxListLength);

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
    console.log(target);
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
        setSelectedRows([]);
        return;
      }
      if (isPlayQueueItem(item) && !target) {
        await moveLast(item);
        setSelectedRows([]);
        return;
      }
    }
    if (itemType === DragActions.MOVE_TRACKS) {
      if (Array.isArray(item) && target) {
        const moveIds = item.map((el) => el.id);
        const prevId = getPrevId(target.id);
        await moveMany(moveIds, prevId as number);
        setSelectedRows([]);
      }
    }
  }, [addLast, addMany, addOne, getPrevId, items, moveLast, moveMany, moveTrack, setSelectedRows]);

  const [, drop] = useDrop(() => ({
    accept: [
      DragActions.COPY_TRACK,
      DragActions.COPY_TRACKS,
      DragActions.MOVE_TRACK,
      DragActions.MOVE_TRACKS,
    ],
    drop: (
      item: PlayQueueItem | Track | Track[],
      monitor,
    ) => handleDrop(dropIndex.current, item, monitor.getItemType()),
  }), [playQueue]);

  const [, drag, dragPreview] = useDrag(() => ({
    previewOptions,
    type: selectedRows.length > 1 ? DragActions.MOVE_TRACKS : DragActions.MOVE_TRACK,
    item: () => {
      if (selectedRows.length === 1) {
        return items![selectedRows[0]];
      }
      if (selectedRows.length > 1) {
        return selectedRows.map((n) => items![n]);
      }
      return undefined;
    },
    canDrag: selectedRows.length < 10,
  }), [items, selectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const handleDrag = useCallback((node: any) => {
    drag(drop(node));
  }, [drag, drop]);

  const handleDragStart = useCallback(() => {
    if (selectedRows.includes(hoverIndex.current!)) {
      return;
    }
    setSelectedRows([hoverIndex.current!]);
  }, [selectedRows, setSelectedRows]);

  const handleDropCapture = () => {
    dropIndex.current = -1;
  };

  const removeTrack = useCallback(async (item: PlayQueueItem) => {
    const newQueue = await removeFromQueue(item.id);
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [player, removeFromQueue, updateQueue]);

  const virtuosoContext = useMemo(() => ({
    dropIndex,
    handleRowClick,
    hoverIndex,
    library,
    items,
    playQueueItem,
    removeTrack,
    selectedRows,
  }), [
    dropIndex,
    handleRowClick,
    hoverIndex,
    library,
    items,
    playQueueItem,
    removeTrack,
    selectedRows,
  ]);

  if (!items) {
    return null;
  }

  return (
    <>
      <Box
        color="text.primary"
        display="flex"
        flexDirection="column"
        height={settings.dockedQueue ? 'calc(100vh - 230px)' : 'calc(100vh - 214px)'}
        ref={ref}
      >
        <Box
          display="flex"
          flexDirection="column"
          height="-webkit-fill-available"
          ref={handleDrag}
          onDragStartCapture={handleDragStart}
          onDropCapture={handleDropCapture}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            <Virtuoso
              context={virtuosoContext}
              data={items}
              fixedItemHeight={56}
              itemContent={(index, item, context) => RowContent({ index, item, context })}
              style={{ height: items.length * 56, marginLeft: '4px', marginRight: '8px' }}
            />
          </ClickAwayListener>
          <Box
            className={styles['single-track']}
            flexGrow={1}
            ref={box}
            sx={{ marginLeft: '4px', marginRight: '8px' }}
            onDragEnter={() => {
              box.current?.classList.add(styles['single-track-over']);
            }}
            onDragLeave={() => {
              box.current?.classList.remove(styles['single-track-over']);
            }}
            onDrop={() => {
              box.current?.classList.remove(styles['single-track-over']);
            }}
          />
        </Box>
      </Box>
      <SvgIcon
        sx={{
          bottom: 0,
          color: 'text.secondary',
          height: '38px',
          position: 'absolute',
          width: '100%',
        }}
        viewBox="0 -8 24 38"
      >
        <FiMoreHorizontal />
      </SvgIcon>
    </>
  );
};

export default UpcomingTracksVirtuoso;
