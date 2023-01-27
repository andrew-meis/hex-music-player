import { Skeleton } from '@mui/lab';
import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Artist, Album as TAlbum, Playlist, Track } from 'hex-plex';
import { countBy } from 'lodash';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { GroupedVirtuoso } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import { ButtonSpecs } from 'constants/buttons';
import useFormattedTime from 'hooks/useFormattedTime';
import useMenuStyle from 'hooks/useMenuStyle';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useAlbum, useAlbumTracks } from 'queries/album-queries';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import ListGrouped from 'routes/virtuoso-components/ListGrouped';
import { isTrack } from 'types/type-guards';
import GroupRow from './GroupRow';
import Header from './Header';
import Row from './Row';
import type { IVirtuosoContext, RouteParams } from 'types/interfaces';

const ScrollSeekPlaceholder = ({ height }: { height: number }) => (
  <Box alignItems="center" display="flex" height={height}>
    <Box width="50px" />
    <Box flexGrow={1} marginLeft="8px" width="50%">
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

export interface AlbumContext extends IVirtuosoContext {
  album: {album: TAlbum, related: (Playlist | Track | TAlbum | Artist)[]} | undefined;
  navigate: NavigateFunction;
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
  const library = useLibrary();
  // data loading
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const album = useAlbum(+id, library);
  const albumTracks = useAlbumTracks(+id, library);
  const counts = countBy(albumTracks.data, 'parentIndex');
  const groupCounts = Object.values(counts);
  const groups = Object.keys(counts).map((i) => +i);
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const location = useLocation();
  const menuStyle = useMenuStyle();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playAlbumAtTrack, playSwitch } = usePlayback();
  const {
    selectedRows, setSelectedRows, handleClickAway, handleRowClick,
  } = useRowSelect([]);
  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: albumTracks.data || [],
  });

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [id, setSelectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const getTrackId = useCallback(() => {
    if (!albumTracks.data) {
      return 0;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => albumTracks.data[n]);
      return track.id;
    }
    return 0;
  }, [albumTracks.data, selectedRows]);

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

  const albumContext = useMemo(() => ({
    album: album.data,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
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
          initialScrollTop={initialScrollTop()}
          isScrolling={handleScrollState}
          itemContent={(index, _groupIndex, _item, context) => RowContent(
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
      <TrackMenu
        anchorPoint={anchorPoint}
        handleMenuSelection={handleMenuSelection}
        id={getTrackId()}
        menuProps={menuProps}
        menuStyle={menuStyle}
        selectedRows={selectedRows}
        toggleMenu={toggleMenu}
      />
    </>
  );
};

export default Album;
