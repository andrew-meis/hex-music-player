import { SvgIcon, useTheme } from '@mui/material';
import {
  ControlledMenu, MenuDivider, MenuItem, useMenuState,
} from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { MdDelete } from 'react-icons/all';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { useKey } from 'react-use';
import { Virtuoso } from 'react-virtuoso';
import { useRemoveFromPlaylist } from 'hooks/playlistHooks';
import useFormattedTime from 'hooks/useFormattedTime';
import useMenuStyle from 'hooks/useMenuStyle';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useToast from 'hooks/useToast';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { usePlaylist, usePlaylistItems } from 'queries/playlist-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import Header from './Header';
import Row from './Row';
import type { Playlist as TPlaylist, PlaylistItem, Track } from 'hex-plex';
import type { IVirtuosoContext, RouteParams } from 'types/interfaces';

export interface PlaylistContext extends IVirtuosoContext {
  filter: string;
  playlist: TPlaylist | undefined;
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
  const hoverIndex = useRef<number | null>(null);
  const location = useLocation();
  const menuStyle = useMenuStyle();
  const navigationType = useNavigationType();
  const removeFromPlaylist = useRemoveFromPlaylist();
  const theme = useTheme();
  const toast = useToast();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('');
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playPlaylistAtTrack, playSwitch } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  let items: PlaylistItem[] = [];
  if (playlistItems.data) {
    items = playlistItems.data.filter(
      (item) => item.track.title?.toLowerCase().includes(filter.toLowerCase())
      || item.track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || item.track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || item.track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: items.map((item) => item.track),
  });

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [id, setSelectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-index');
    if (!target) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    if (selectedRows.length === 0) {
      setSelectedRows([targetIndex]);
    }
    if (selectedRows.length === 1 && selectedRows.includes(targetIndex)) {
      // pass
    }
    if (selectedRows.length === 1 && !selectedRows.includes(targetIndex)) {
      setSelectedRows([targetIndex]);
    }
    if (selectedRows.length > 1 && selectedRows.includes(targetIndex)) {
      // pass
    }
    if (selectedRows.length > 1 && !selectedRows.includes(targetIndex)) {
      setSelectedRows([targetIndex]);
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

  const handleMenuSelection = async (button: ButtonSpecs) => {
    if (!items) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => items[n].track);
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const tracks = selectedRows.map((n) => items[n].track);
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
    }
  };

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
    await selectedItems.forEach((item) => {
      removeFromPlaylist(item.playlistId, item.id);
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

  const initialScrollTop = () => {
    let top;
    top = sessionStorage.getItem(id);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

  const playlistContext = useMemo(() => ({
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playlist: playlist.data,
    playPlaylistAtTrack,
    selectedRows,
    setFilter,
  }), [
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
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
          initialScrollTop={initialScrollTop()}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ index, item, context })}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={items.length}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              id,
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
      <ControlledMenu
        {...menuProps}
        portal
        anchorPoint={anchorPoint}
        menuStyle={menuStyle}
        onClose={() => toggleMenu(false)}
      >
        {selectedRows.length === 1 && trackButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        {selectedRows.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        {!playlist.data!.smart && (
        <>
          <MenuDivider />
          <MenuItem
            style={{
              '--menu-primary': theme.palette.error.main,
              '--menu-transparent': `${theme.palette.error.main}cc`,
            } as React.CSSProperties}
            onClick={handleRemove}
          >
            <SvgIcon sx={{ mr: '8px' }}><MdDelete /></SvgIcon>
            Remove
          </MenuItem>
        </>
        )}
      </ControlledMenu>
    </>
  );
};

export default Playlist;
