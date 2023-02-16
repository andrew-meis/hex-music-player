import { useMenuState } from '@szhsin/react-menu';
import { useInfiniteQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Track } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IConfig, IVirtuosoContext } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

const containerSize = 100;

const roundDown = (x: number) => Math.floor(x / containerSize) * containerSize;

export interface TracksContext extends IVirtuosoContext {
  config: IConfig;
  playUri: (uri: string, shuffle?: boolean, key?: string) => Promise<void>;
  uri: string;
}

export interface RowProps {
  context: TracksContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Tracks = () => {
  const fetchTimeout = useRef(0);
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const location = useLocation();
  const navigationType = useNavigationType();
  const range = useRef<ListRange>();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [containerStart, setContainerStart] = useState(0);
  const [menuProps, toggleMenu] = useMenuState();
  const { getFormattedTime } = useFormattedTime();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: config } = useConfig();
  const { playSwitch, playUri } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const fetchTracks = async ({ pageParam = 0 }) => {
    const response = library.tracks(config.sectionId!, {
      'X-Plex-Container-Start': pageParam,
      'X-Plex-Container-Size': containerSize,
    });
    return response;
  };

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['all-tracks'],
    queryFn: fetchTracks,
    getNextPageParam: () => 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data || data.pageParams.includes(containerStart)) return;
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

  const selectedTracks = useMemo(() => {
    if (!flatTracks) {
      return undefined;
    }
    if (selectedRows.length > 0) {
      return selectedRows.map((n) => flatTracks[n]);
    }
    return undefined;
  }, [selectedRows, flatTracks]);

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
      clearTimeout(fetchTimeout.current);
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
      fetchTimeout.current = window.setTimeout(() => {
        if (!data || !range.current) return;
        let value = roundDown(range.current.endIndex);
        if (roundDown(range.current.startIndex) !== roundDown(range.current.endIndex)) {
          if (!data.pageParams.includes(roundDown(range.current.startIndex))) {
            value = roundDown(range.current.startIndex);
          }
        }
        if (containerStart !== value) {
          setContainerStart(value);
        }
      }, 200);
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem('tracks-scroll');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'tracks-scroll',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const uri = useMemo(() => {
    const uriParams = {
      type: 10,
    };
    // eslint-disable-next-line max-len
    return `/library/sections/${config.sectionId}/all?${new URLSearchParams(uriParams as any).toString()}`;
  }, [config.sectionId]);

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
    playUri,
    selectedRows,
    uri,
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
    playUri,
    selectedRows,
    uri,
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
        onAnimationComplete={() => virtuoso.current
          ?.scrollTo({ top: initialScrollTop })}
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
          rangeChanged={(newRange) => {
            range.current = newRange;
          }}
          ref={virtuoso}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={data.pages[0].totalSize}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              'tracks-scroll',
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

export default Tracks;
