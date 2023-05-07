import { Avatar, Box, ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { useQuery } from '@tanstack/react-query';
import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { TiArrowBack } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import { ItemProps, Virtuoso } from 'react-virtuoso';
import { Library, PlayQueueItem } from 'api/index';
import 'styles/queue.scss';
import PreviousMenu from 'components/menus/PreviousMenu';
import Subtext from 'components/subtext/Subtext';
import { typographyStyle } from 'constants/style';
import useDragActions from 'hooks/useDragActions';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useLibrary, useSettings } from 'queries/app-queries';
import { useCurrentQueue } from 'queries/plex-queries';
import { DragTypes } from 'types/enums';

export interface PreviousTracksContext {
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleMoveTrack: (item: PlayQueueItem) => Promise<void>;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  library: Library;
  items: PlayQueueItem[] | undefined;
  playQueueItem: (item: PlayQueueItem) => Promise<void>;
  selectedRows: number[];
}

const Item = React
  .forwardRef((
    {
      style, children, context, ...props
    }: ItemProps<PlayQueueItem> & { context?: PreviousTracksContext | undefined},
    itemRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      {...props}
      className="queue-item"
      ref={itemRef}
      style={style}
      onContextMenu={(event) => context!.handleContextMenu(event)}
    >
      {children}
    </div>
  ));

Item.defaultProps = {
  context: undefined,
};

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
  const { data: isDragging } = useQuery(
    ['is-dragging'],
    () => false,
    {
      staleTime: Infinity,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const selected = selectedRows.includes(index);

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
      sx={{
        border: '1px solid transparent',
      }}
      onMouseEnter={handleMouseEnter}
    >
      <Box
        alignItems="center"
        className={`track ${selected ? 'selected' : ''}`}
        data-dragging={isDragging ? 'true' : 'false'}
        data-item-index={index}
        display="flex"
        height={52}
        onClick={(event) => handleRowClick(event, index)}
        onDoubleClick={handleDoubleClick}
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
            fontFamily="Rubik, sans-serif"
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
        {!isDragging && (
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
        )}
      </Box>
    </Box>
  );
});

const RowContent = (props: RowProps) => <Row {...props} />;

const PreviousTracksVirtuoso = () => {
  const box = useRef<HTMLDivElement | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuProps, toggleMenu] = useMenuState({ transition: true });
  const { data: playQueue } = useCurrentQueue();
  const { data: settings } = useSettings();
  const { moveNext } = useDragActions();
  const { playQueueItem } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const items = useMemo(() => playQueue?.items
    .slice(0, playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId))
    .reverse()
    .slice(0, 30), [playQueue]);

  const selectedPreviousItems = useMemo(() => {
    if (!items) {
      return undefined;
    }
    if (selectedRows.length > 0) {
      return selectedRows.map((n) => items[n]);
    }
    return undefined;
  }, [selectedRows, items]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-index');
    if (!target) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    switch (true) {
      case selectedRows.length === 0:
        setSelectedRows([targetIndex]);
        break;
      case selectedRows.length === 1 && !selectedRows.includes(targetIndex):
        setSelectedRows([targetIndex]);
        break;
      case selectedRows.length > 1 && !selectedRows.includes(targetIndex):
        setSelectedRows([targetIndex]);
        break;
      default:
        break;
    }
    menuRef.current = event.currentTarget;
    document.querySelector('.titlebar')?.classList.add('titlebar-nodrag');
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

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
      await moveNext(item.id, playQueue.selectedItemId);
      setSelectedRows([]);
    }
  }, [moveNext, playQueue, setSelectedRows]);

  const virtuosoContext = useMemo(() => ({
    handleContextMenu,
    handleMoveTrack,
    handleRowClick,
    hoverIndex,
    library,
    items,
    playQueueItem,
    selectedRows,
  }), [
    handleContextMenu,
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
            components={{
              Item,
            }}
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
            marginRight: '10px',
          }}
        />
      </Box>
      <PreviousMenu
        arrow
        align="center"
        anchorRef={menuRef}
        currentId={playQueue?.selectedItemId}
        direction="left"
        items={selectedPreviousItems}
        toggleMenu={toggleMenu}
        viewScroll="close"
        {...menuProps}
      />
    </Box>
  );
};

export default PreviousTracksVirtuoso;
