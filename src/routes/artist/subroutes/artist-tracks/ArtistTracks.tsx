import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Album, Library, PlayQueueItem, Track } from 'api/index';
import { PlexSort } from 'classes';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import {
  ArtistQueryData,
  useArtist,
  useArtistAppearances,
  useArtistTracks,
} from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { AppConfig, LocationWithState, RouteParams } from 'types/interfaces';
import Header from './Header';
import List from './List';
import Row from './Row';

export interface ArtistTracksContext {
  albums: Album[];
  artist: ArtistQueryData | undefined;
  config: AppConfig;
  filter: string;
  getFormattedTime: (inMs: number) => string;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  items: Track[];
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  playTracks: (tracks: Track[], shuffle?: boolean, key?: string) => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSort: React.Dispatch<React.SetStateAction<PlexSort>>;
  sort: PlexSort;
}

export interface RowProps {
  context: ArtistTracksContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const ArtistTracks = () => {
  const config = useConfig();
  const library = useLibrary();
  const navigationType = useNavigationType();
  // data loading
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const [sort, setSort] = useState(() => {
    if (navigationType === 'POP') {
      return (sessionStorage.getItem(`artist-tracks-sort ${id}`)
        ? PlexSort.parse(sessionStorage.getItem(`artist-tracks-sort ${id}`)!)
        : location.state.sort);
    }
    return location.state.sort;
  });
  const artist = useArtist(+id, library);
  const appearances = useArtistAppearances(
    config.data,
    library,
    +id,
    location.state.title,
    location.state.guid,
  );
  const { data: tracks, isLoading } = useArtistTracks({
    config: config.data,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    removeDupes: false,
    sort,
  });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const scrollCount = useRef(0);
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [filter, setFilter] = useState('');
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playTracks } = usePlayback();

  useEffect(() => () => sessionStorage
    .setItem(`artist-tracks-sort ${id}`, sort.stringify()), [id, sort]);

  const albums: Album[] = useMemo(() => {
    const newAlbums = [];
    if (artist.data && appearances.data) {
      newAlbums.push(...artist.data.albums);
      artist.data.hubs.forEach((hub) => {
        if (hub.type === 'album') newAlbums.push(...hub.items as Album[]);
      });
      newAlbums.push(...appearances.data);
    }
    return newAlbums;
  }, [appearances.data, artist.data]);

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
    top = sessionStorage.getItem(`artist-tracks-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `artist-tracks-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const artistTracksContext: ArtistTracksContext = useMemo(() => ({
    albums,
    artist: artist.data,
    config: config.data,
    filter,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    setFilter,
    setSort,
    sort,
  }), [
    albums,
    artist.data,
    config,
    filter,
    getFormattedTime,
    hoverIndex,
    items,
    isPlaying,
    library,
    nowPlaying,
    playTracks,
    setFilter,
    setSort,
    sort,
  ]);

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
        context={artistTracksContext}
        data={artist.isLoading || appearances.isLoading || isLoading ? [] : items}
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
            `artist-tracks-scroll ${id}`,
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default ArtistTracks;
