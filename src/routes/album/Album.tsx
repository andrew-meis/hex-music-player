import { Skeleton } from '@mui/lab';
import { Box, Typography } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Artist, Album as AlbumType, Library, Playlist, PlayQueueItem, Track } from 'hex-plex';
import { countBy } from 'lodash';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { NavigateFunction, useLocation, useNavigate, useParams } from 'react-router-dom';
import { GroupedVirtuoso } from 'react-virtuoso';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import {
  useAlbum, useAlbumTracks, useIsPlaying, useLibrary, useNowPlaying,
} from '../../hooks/queryHooks';
import useFormattedTime from '../../hooks/useFormattedTime';
import useMenuStyle from '../../hooks/useMenuStyle';
import usePlayback from '../../hooks/usePlayback';
import useRowSelect from '../../hooks/useRowSelect';
import useTrackDragDrop from '../../hooks/useTrackDragDrop';
import { RouteParams } from '../../types/interfaces';
import { isDiscHeader, isTrack } from '../../types/type-guards';
import Footer from '../virtuoso-components/Footer';
import Item from '../virtuoso-components/Item';
import ListGrouped from '../virtuoso-components/ListGrouped';
import GroupRow from './GroupRow';
import Header from './Header';
import Row from './Row';

const ScrollSeekPlaceholder = ({ height }: { height: number }) => (
  <Box alignItems="center" display="flex" height={height}>
    <Box width="50px" />
    <Box flexGrow={1} width="50%">
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="40%" />
    </Box>
    <Box mx="5px">
      <Skeleton variant="text" width="80px" />
    </Box>
    <Box width="50px">
      <Skeleton variant="text" width="50px" />
    </Box>
    <Box width="10px" />
  </Box>
);

export interface AlbumContext {
  album: {album: AlbumType, related: (Playlist | Track | AlbumType | Artist)[]} | undefined;
  drag: ConnectDragSource,
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  playAlbumAtTrack: (track: Track, shuffle?: boolean) => Promise<void>;
  selectedRows: number[];
}

export interface GroupRowProps {
  context: AlbumContext;
  discNumber: number;
}

export interface RowProps {
  context: AlbumContext;
  index: number;
  track: Track;
}

const GroupRowContent = (props: GroupRowProps) => <GroupRow {...props} />;
const RowContent = (props: RowProps) => <Row {...props} />;

const Album = () => {
  // data loading
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const album = useAlbum(+id);
  const albumTracks = useAlbumTracks(+id);
  const counts = countBy(albumTracks.data, 'parentIndex');
  const groupCounts = Object.values(counts);
  const groups = Object.keys(counts).map((i) => +i);
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const location = useLocation();
  const menuStyle = useMenuStyle();
  const navigate = useNavigate();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playAlbumAtTrack, playSwitch } = usePlayback();
  const {
    selectedRows, setSelectedRows, handleClickAway, handleRowClick,
  } = useRowSelect([]);
  const { drag, dragPreview, handleDragStart } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    setSelectedRows,
    tracks: albumTracks.data || [],
  });

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [id, setSelectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-item-index');
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
    if (!albumTracks.data) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => albumTracks.data[n]);
      if (isDiscHeader(track)) {
        return;
      }
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const tracks = selectedRows.map((n) => albumTracks.data[n]);
      if (tracks.every((item) => isTrack(item))) {
        // @ts-ignore
        await playSwitch(button.action, { tracks, shuffle: button.shuffle });
      }
    }
  };

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const albumContext = useMemo(() => ({
    album: album.data,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDragStart,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    navigate,
    nowPlaying,
    playAlbumAtTrack,
    selectedRows,
  }), [
    album.data,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDragStart,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    navigate,
    nowPlaying,
    playAlbumAtTrack,
    selectedRows,
  ]);

  if (album.isLoading || albumTracks.isLoading) {
    return null;
  }

  if (!album.data || albumTracks.data!.length === 0) {
    return (
      <Typography color="text.primary" variant="h5">
        Empty album!
      </Typography>
    );
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
        <GroupedVirtuoso
          className="scroll-container"
          components={{
            Footer,
            Header,
            Item,
            List: ListGrouped,
            ScrollSeekPlaceholder,
          }}
          context={albumContext}
          fixedItemHeight={56}
          groupContent={(index) => GroupRowContent(
            { context: albumContext, discNumber: groups[index] },
          )}
          groupCounts={groupCounts}
          isScrolling={handleScrollState}
          itemContent={(index, groupIndex, _item, context) => RowContent(
            { context, index, track: albumTracks.data![index] },
          )}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 700,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
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
      </ControlledMenu>
    </>
  );
};

export default Album;
