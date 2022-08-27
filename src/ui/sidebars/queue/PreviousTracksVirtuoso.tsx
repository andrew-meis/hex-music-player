import { Avatar, Box, ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { Library, PlayQueueItem } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { FiMoreHorizontal, TiArrowBack } from 'react-icons/all';
import { useMeasure } from 'react-use';
import { Virtuoso } from 'react-virtuoso';
import styles from 'styles/Queue.module.scss';
import Subtext from '../../../components/subtext/Subtext';
import { useCurrentQueue, useLibrary, useSettings } from '../../../hooks/queryHooks';
import useDragActions from '../../../hooks/useDragActions';
import usePlayback from '../../../hooks/usePlayback';
import useRowSelect from '../../../hooks/useRowSelect';
import { DragActions } from '../../../types/enums';

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

export interface PreviousTracksContext {
  handleMoveTrack: (item: PlayQueueItem) => Promise<void>;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  library: Library;
  items: PlayQueueItem[] | undefined;
  playQueueItem: (item: PlayQueueItem) => Promise<void>;
  selectedRows: number[];
}

export interface RowProps {
  index: number;
  item: PlayQueueItem;
  context: PreviousTracksContext;
}

const Row = React.memo(({ index, item, context }: RowProps) => {
  const box = useRef<HTMLDivElement | null>(null);
  const {
    handleMoveTrack,
    handleRowClick,
    hoverIndex,
    library,
    playQueueItem,
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
      <Box title="Move to queue">
        <SvgIcon
          sx={{
            mx: '6px',
            transform: 'rotate(90deg)',
            color: 'text.primary',
            width: '0.9em',
            height: '0.9em',
            transition: 'transform 200ms ease-in-out',
            '&:hover': {
              color: 'primary.main',
              transform: 'rotate(90deg) scale(1.3)',
            },
          }}
          onClick={() => handleMoveTrack(item)}
        >
          <TiArrowBack />
        </SvgIcon>
      </Box>
    </Box>
  );
});

const RowContent = (props: RowProps) => <Row {...props} />;

const PreviousTracksVirtuoso = () => {
  const box = useRef<HTMLDivElement | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const [ref, { height }] = useMeasure();
  const { data: playQueue } = useCurrentQueue();
  const { data: settings } = useSettings();
  const { moveTrack } = useDragActions();
  const { playQueueItem } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const maxListLength = Math.floor(height / 56);
  const items = playQueue?.items
    .slice(0, playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId))
    .reverse()
    .slice(0, maxListLength);

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

  const handleDragStart = useCallback(() => {
    if (selectedRows.includes(hoverIndex.current!)) {
      return;
    }
    setSelectedRows([hoverIndex.current!]);
  }, [selectedRows, setSelectedRows]);

  const handleMoveTrack = useCallback(async (item: PlayQueueItem) => {
    if (playQueue) {
      await moveTrack(item.id, playQueue.selectedItemId);
      setSelectedRows([]);
    }
  }, [moveTrack, playQueue, setSelectedRows]);

  const virtuosoContext = useMemo(() => ({
    handleMoveTrack,
    handleRowClick,
    hoverIndex,
    library,
    items,
    playQueueItem,
    selectedRows,
  }), [
    handleMoveTrack,
    handleRowClick,
    hoverIndex,
    library,
    items,
    playQueueItem,
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
          ref={drag}
          onDragStartCapture={handleDragStart}
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
          color: 'transparent',
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

export default PreviousTracksVirtuoso;
