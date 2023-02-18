import { Avatar, Box, ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { Library, PlayQueueItem } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { TiArrowBack } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import 'styles/queue.scss';
import Subtext from 'components/subtext/Subtext';
import { selectedStyle, selectBorderRadius, rowStyle, typographyStyle } from 'constants/style';
import useDragActions from 'hooks/useDragActions';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useLibrary, useSettings } from 'queries/app-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import { DragTypes } from 'types/enums';

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
      className="queue-track"
      data-index={index}
      display="flex"
      height={54}
      sx={selected
        ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
        : { ...rowStyle }}
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
          <NavLink
            className="link"
            style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
            to={`/tracks/${track.id}`}
            onClick={(event) => event.stopPropagation()}
          >
            {track.title}
          </NavLink>
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
          onClick={async (event) => {
            event.stopPropagation();
            await handleMoveTrack(item);
          }}
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
  const { data: playQueue } = useCurrentQueue();
  const { data: settings } = useSettings();
  const { moveTrack } = useDragActions();
  const { playQueueItem } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const items = useMemo(() => playQueue?.items
    .slice(0, playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId))
    .reverse(), [playQueue]);

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    items: items || [],
    selectedRows,
    type: DragTypes.PLAYQUEUE_ITEM,
  });

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
    <Box
      color="text.primary"
      display="flex"
      flexDirection="column"
      height={settings.dockedQueue ? 'calc(100vh - 192px)' : 'calc(100vh - 206px)'}
    >
      <Box
        display="flex"
        flexDirection="column"
        height="-webkit-fill-available"
        ref={drag}
        onDragEndCapture={handleClickAway}
        onDragStartCapture={handleDragStart}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Virtuoso
            className="scroll-container"
            context={virtuosoContext}
            data={items}
            fixedItemHeight={56}
            itemContent={(index, item, context) => RowContent({ index, item, context })}
            style={{ height: items.length * 56, marginLeft: '4px', scrollbarGutter: 'stable' }}
          />
        </ClickAwayListener>
        <Box
          className="queue-box"
          flexGrow={1}
          ref={box}
          sx={{
            marginLeft: '4px',
            marginRight: '8px',
          }}
        />
      </Box>
    </Box>
  );
};

export default PreviousTracksVirtuoso;
