import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Artist, Album as TAlbum, Playlist, Track, Genre } from 'hex-plex';
import { countBy, inRange } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useParams,
} from 'react-router-dom';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import TrackMenu from 'components/menus/TrackMenu';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useAlbum, useAlbumTracks } from 'queries/album-queries';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Item from 'routes/virtuoso-components/Item';
import ListGrouped from 'routes/virtuoso-components/ListGrouped';
import { DragTypes } from 'types/enums';
import { VirtuosoContext, RouteParams } from 'types/interfaces';
import Footer from './Footer';
import GroupRow from './GroupRow';
import Header from './Header';
import Row from './Row';

export interface AlbumContext extends VirtuosoContext {
  album: {album: TAlbum, related: (Playlist | Track | TAlbum | Artist | Genre)[]} | undefined;
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
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const virtuoso = useRef<GroupedVirtuosoHandle>(null);
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
    items: albumTracks.data || [],
    selectedRows,
    type: DragTypes.TRACK,
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const selectedTracks = useMemo(() => {
    if (!albumTracks.data) {
      return undefined;
    }
    if (selectedRows.length === 1 && inRange(selectedRows[0], 0, albumTracks.data.length)) {
      return selectedRows.map((n) => albumTracks.data[n]);
    }
    if (selectedRows.length > 1) {
      return selectedRows.map((n) => albumTracks.data[n]);
    }
    return undefined;
  }, [selectedRows, albumTracks.data]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-item-index');
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
    top = sessionStorage.getItem(`album-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `album-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

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
        onAnimationComplete={() => virtuoso.current
          ?.scrollTo({ top: initialScrollTop })}
      >
        <GroupedVirtuoso
          className="scroll-container"
          components={{
            Footer,
            Header,
            Item,
            List: ListGrouped,
          }}
          context={albumContext}
          fixedItemHeight={56}
          groupContent={(index) => GroupRowContent(
            { context: albumContext, discNumber: groups[index] },
          )}
          groupCounts={groupCounts}
          isScrolling={handleScrollState}
          itemContent={(index, _groupIndex, _item, context) => RowContent(
            { context, index, track: albumTracks.data![index] },
          )}
          ref={virtuoso}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              `album-scroll ${id}`,
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
      />
    </>
  );
};

export default Album;
