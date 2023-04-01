import { Box, SvgIcon } from '@mui/material';
import { MenuDivider, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { MdDelete } from 'react-icons/all';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { useKey } from 'react-use';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Playlist as TypePlaylist, PlaylistItem, PlayQueueItem, Track } from 'api/index';
import TrackMenu from 'components/menus/TrackMenu';
import { WIDTH_CALC } from 'constants/measures';
import { useMoveManyPlaylistItems, useRemoveFromPlaylist } from 'hooks/playlistHooks';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useToast from 'hooks/useToast';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { usePlaylist, usePlaylistItems } from 'queries/playlist-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { DragTypes } from 'types/enums';
import { VirtuosoContext, RouteParams } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

// eslint-disable-next-line react/require-default-props
const Footer = ({ context }: { context?: PlaylistContext }) => {
  const [, drop] = useDrop(() => ({
    accept: [
      DragTypes.PLAYLIST_ITEM,
      DragTypes.PLAYQUEUE_ITEM,
      DragTypes.TRACK,
    ],
    drop: (
      item: PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => context!.handleDrop(item, Infinity, monitor.getItemType()),
  }), [context!.items]);

  return (
    <Box
      className="playlist-footer"
      data-smart={context!.playlist?.smart}
      height="24px"
      maxWidth={900}
      mx="auto"
      ref={context!.playlist?.smart ? null : drop}
      width={WIDTH_CALC}
      onDragEnter={() => {
        document.querySelector('.playlist-footer')
          ?.classList.add('playlist-footer-over');
      }}
      onDragLeave={() => {
        document.querySelector('.playlist-footer')
          ?.classList.remove('playlist-footer-over');
      }}
      onDrop={() => {
        document.querySelector('.playlist-footer')
          ?.classList.remove('playlist-footer-over');
      }}
    />
  );
};

export interface PlaylistContext extends Omit<VirtuosoContext, 'drag'> {
  drag: (node: any) => void;
  dropIndex: React.MutableRefObject<number | null>;
  filter: string;
  handleDrop: (array: any[], index: number | null, itemType: null | string | symbol) => void;
  items: PlaylistItem[];
  playlist: TypePlaylist | undefined;
  playPlaylistAtTrack: (track: Track, shuffle?: boolean) => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

export interface RowProps {
  index: number;
  item: PlaylistItem;
  context: PlaylistContext;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Playlist = () => {
  const library = useLibrary();
  // data loading
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const playlist = usePlaylist(+id, library);
  const playlistItems = usePlaylistItems(+id, library);
  // other hooks
  const dropIndex = useRef<number | null>(null);
  const hoverIndex = useRef<number | null>(null);
  const location = useLocation();
  const moveMany = useMoveManyPlaylistItems();
  const navigationType = useNavigationType();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const scrollCount = useRef(0);
  const toast = useToast();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('');
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playPlaylistAtTrack, playSwitch } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  let items: PlaylistItem[] = useMemo(() => [], []);
  if (playlistItems.data) {
    items = playlistItems.data.filter(
      (item) => item.track.title?.toLowerCase().includes(filter.toLowerCase())
      || item.track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || item.track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || item.track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  const getPrevId = useCallback((itemId: PlaylistItem['id']) => {
    try {
      if (playlistItems.data) {
        const index = playlistItems.data.findIndex((item) => item.id === itemId);
        return playlistItems.data[index - 1].id;
      }
      return undefined;
    } catch {
      return undefined;
    }
  }, [playlistItems.data]);

  const handleDrop = useCallback((
    array: any[],
    index: number | null,
    itemType: null | string | symbol,
  ) => {
    if (!playlistItems.data || !items || typeof index !== 'number') {
      return;
    }
    const target = items[index];
    if (itemType === DragTypes.PLAYLIST_ITEM && target) {
      const prevId = getPrevId(target.id);
      moveMany(+id, array.map((item) => item.id), prevId);
    }
    if (itemType === DragTypes.PLAYLIST_ITEM && !target) {
      moveMany(+id, array.map((item) => item.id), playlistItems.data.slice(-1)[0].id);
    }
  }, [getPrevId, id, items, moveMany, playlistItems.data]);

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
  }), [items]);

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    items,
    selectedRows,
    type: DragTypes.PLAYLIST_ITEM,
  });

  const dragDrop = useCallback((node: any) => {
    drag(drop(node));
  }, [drag, drop]);

  useEffect(() => {
    setSelectedRows([]);
  }, [id, setSelectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const selectedTracks = useMemo(() => {
    if (!items) {
      return undefined;
    }
    if (selectedRows.length > 0) {
      return selectedRows.map((n) => items[n].track);
    }
    return undefined;
  }, [selectedRows, items]);

  const handleContainerDrop = () => {
    dropIndex.current = -1;
  };

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
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

  const handleRemove = async () => {
    if (!items) {
      return;
    }
    if (playlist.data!.smart) {
      toast({ type: 'error', text: 'Cannot edit smart playlist' });
      return;
    }
    const selectedItems = selectedRows.map((n) => items[n]);
    setSelectedRows([]);
    selectedItems.forEach(async (item) => {
      await removeFromPlaylist(item.playlistId, item.id);
    });
  };

  useKey('Delete', handleRemove, { event: 'keyup' }, [selectedRows]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`playlist-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `playlist-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const playlistContext = useMemo(() => ({
    drag: playlist.data?.smart ? drag : dragDrop,
    dropIndex,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDrop,
    handleRowClick,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playlist: playlist.data,
    playPlaylistAtTrack,
    selectedRows,
    setFilter,
  }), [
    drag,
    dragDrop,
    dropIndex,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDrop,
    handleRowClick,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playlist.data,
    playPlaylistAtTrack,
    selectedRows,
    setFilter,
  ]);

  if (playlist.isLoading || playlistItems.isLoading) {
    return null;
  }

  return (
    <>
      <motion.div
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        initial={{ opacity: 0 }}
        key={location.pathname}
        style={{ height: '100%' }}
        onAnimationComplete={() => virtuoso.current
          ?.scrollTo({ top: initialScrollTop })}
        onDropCapture={handleContainerDrop}
      >
        <Virtuoso
          className="scroll-container"
          components={{
            Footer,
            Header,
            Item,
            List,
            ScrollSeekPlaceholder,
          }}
          context={playlistContext}
          data={items}
          fixedItemHeight={56}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ index, item, context })}
          ref={virtuoso}
          scrollSeekConfiguration={{
            enter: (velocity) => {
              if (scrollCount.current < 10) return false;
              return Math.abs(velocity) > 500;
            },
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={items.length}
          onScroll={(e) => {
            if (scrollCount.current < 10) scrollCount.current += 1;
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              `playlist-scroll ${id}`,
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedTracks}
        {...menuProps}
      >
        {!playlist.data!.smart && (
        <>
          <MenuDivider />
          <MenuItem
            className="error"
            onClick={handleRemove}
          >
            <SvgIcon sx={{ mr: '8px' }}><MdDelete /></SvgIcon>
            Remove
          </MenuItem>
        </>
        )}
      </TrackMenu>
    </>
  );
};

export default Playlist;
