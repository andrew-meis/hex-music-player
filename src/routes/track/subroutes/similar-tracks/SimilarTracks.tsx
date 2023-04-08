import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Library, PlayQueueItem, Track } from 'api/index';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useSimilarTracks, useTrack } from 'queries/track-queries';
import Footer from 'routes/virtuoso-components/Footer';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { AppConfig, LocationWithState, RouteParams } from 'types/interfaces';
import Header from './Header';
import List from './List';
import Row from './Row';

export interface SimilarTracksContext {
  config: AppConfig;
  currentTrack: Track | undefined;
  filter: string;
  getFormattedTime: (inMs: number) => string;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  items: Track[];
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
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
  const scrollCount = useRef(0);
  const queryClient = useQueryClient();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [filter, setFilter] = useState('');
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playTracks } = usePlayback();

  const items = useMemo(() => {
    if (!tracks) {
      return [];
    }
    if (filter === '') {
      return tracks;
    }
    return tracks.filter(
      (track) => track.title?.toLowerCase().includes(filter.toLowerCase())
      || track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [filter, tracks]);

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [id, queryClient]);

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
    top = sessionStorage.getItem(`similar-tracks-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `similar-tracks-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const similarTracksContext: SimilarTracksContext = useMemo(() => ({
    config: config.data,
    currentTrack: currentTrack.data,
    filter,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    setFilter,
  }), [
    config,
    currentTrack.data,
    filter,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    setFilter,
  ]);

  if (currentTrack.isLoading || isLoading) {
    return null;
  }

  return (
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
          List,
          ScrollSeekPlaceholder,
        }}
        context={similarTracksContext}
        data={currentTrack.isLoading || isLoading ? [] : items}
        fixedItemHeight={56}
        isScrolling={handleScrollState}
        itemContent={(index, item, context) => RowContent({ context, index, track: item })}
        ref={virtuoso}
        scrollSeekConfiguration={{
          enter: (velocity) => {
            if (scrollCount.current < 10) return false;
            return Math.abs(velocity) > 500;
          },
          exit: (velocity) => Math.abs(velocity) < 100,
        }}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
        totalCount={isLoading || tracks === undefined ? 0 : items.length}
        onScroll={(e) => {
          if (scrollCount.current < 10) scrollCount.current += 1;
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            `similar-tracks-scroll ${id}`,
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default SimilarTracks;
