import { useMenuState } from '@szhsin/react-menu';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Track } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import { ButtonSpecs } from 'constants/buttons';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IConfig, IVirtuosoContext } from 'types/interfaces';
import Row from './Row';

const roundDown = (x: number) => Math.floor(x / 100) * 100;

export interface TracksContext extends IVirtuosoContext {
  config: IConfig;
}

export interface RowProps {
  context: TracksContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Tracks = () => {
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const location = useLocation();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [containerStart, setContainerStart] = useState(0);
  const [menuProps, toggleMenu] = useMenuState();
  const { getFormattedTime } = useFormattedTime();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: config } = useConfig();
  const { playSwitch } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const fetchTracks = async ({ pageParam = 0 }) => {
    const response = library.tracks(config.sectionId!, {
      'X-Plex-Container-Start': pageParam,
      'X-Plex-Container-Size': 100,
    });
    return response;
  };

  const { data, fetchNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['all-tracks'],
    queryFn: fetchTracks,
    getNextPageParam: () => 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data || data.pageParams.includes(containerStart) || isFetchingNextPage) return;
    fetchNextPage({ pageParam: containerStart });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerStart, data]);

  const flatTracks = useMemo(() => {
    if (!data) return [];
    const array = Array(data.pages[0].totalSize).fill(null);
    data.pages.forEach((page) => {
      array.splice(page.offset, page.tracks.length, ...page.tracks);
    });
    return array as Track[];
  }, [data]);

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: flatTracks || [],
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  useEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

  const getTrackId = useCallback(() => {
    if (!flatTracks) {
      return 0;
    }
    if (selectedRows.length === 1) {
      return flatTracks[selectedRows[0]].id;
    }
    return 0;
  }, [selectedRows, flatTracks]);

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
    if (!flatTracks) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => flatTracks[n]);
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const tracks = selectedRows.map((n) => flatTracks[n]);
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
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

  const tracksContext = useMemo(() => ({
    config,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    selectedRows,
  }), [
    config,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    selectedRows,
  ]);

  if (isLoading || !data) return null;

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
            Item,
            List,
            ScrollSeekPlaceholder,
          }}
          context={tracksContext}
          fixedItemHeight={56}
          increaseViewportBy={168}
          isScrolling={handleScrollState}
          itemContent={(index, _item, context) => {
            const trackContainer = data.pages.find((page) => page.offset === roundDown(index));
            if (trackContainer) {
              const track = trackContainer.tracks[index - trackContainer.offset];
              return RowContent({ context, index, track });
            }
            return (
              <ScrollSeekPlaceholder height={56} />
            );
          }}
          rangeChanged={(range) => {
            let value = roundDown(range.endIndex);
            if (roundDown(range.startIndex) !== roundDown(range.endIndex)) {
              if (!data.pageParams.includes(roundDown(range.startIndex))) {
                value = roundDown(range.startIndex);
              }
            }
            if (containerStart !== value) {
              setContainerStart(value);
            }
          }}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={data.pages[0].totalSize}
        />
      </motion.div>
      <TrackMenu
        anchorPoint={anchorPoint}
        handleMenuSelection={handleMenuSelection}
        id={getTrackId()}
        menuProps={menuProps}
        selectedRows={selectedRows}
        toggleMenu={toggleMenu}
      />
    </>
  );
};

export default Tracks;
