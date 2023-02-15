import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Track } from 'hex-plex';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useSimilarTracks, useTrack } from 'queries/track-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IConfig, IVirtuosoContext, LocationWithState, RouteParams } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

export interface SimilarTracksContext extends IVirtuosoContext {
  config: IConfig;
  currentTrack: Track | undefined;
  filter: string;
  items: Track[];
  playTracks: (tracks: Track[], shuffle?: boolean, key?: string) => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

export interface RowProps {
  context: SimilarTracksContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const SimilarTracks = () => {
  const config = useConfig();
  const library = useLibrary();
  const navigationType = useNavigationType();
  // data loading
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const currentTrack = useTrack({ id: +id, library });
  const { data: tracks, isLoading } = useSimilarTracks({
    library,
    track: currentTrack.data,
  });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('');
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch, playTracks } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  let items: Track[] = useMemo(() => [], []);
  if (tracks) {
    items = tracks.filter(
      (track) => track.title?.toLowerCase().includes(filter.toLowerCase())
      || track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: items || [],
  });

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const selectedTracks = useMemo(() => {
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

  const initialScrollTop = () => {
    let top;
    top = sessionStorage.getItem(`similar-tracks ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

  const similarTracksContext = useMemo(() => ({
    config: config.data,
    currentTrack: currentTrack.data,
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    selectedRows,
    setFilter,
  }), [
    config,
    currentTrack.data,
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    selectedRows,
    setFilter,
  ]);

  if (currentTrack.isLoading || isLoading) {
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
          context={similarTracksContext}
          data={currentTrack.isLoading || isLoading ? [] : items}
          fixedItemHeight={56}
          initialScrollTop={initialScrollTop()}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ context, index, track: item })}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={isLoading || tracks === undefined ? 0 : items.length}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              `similar-tracks ${id}`,
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

export default SimilarTracks;
