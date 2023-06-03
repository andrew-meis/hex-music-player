import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { inPlaceSort } from 'fast-sort';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Library, Playlist as PlaylistType, PlaylistItem, PlayQueueItem, Track } from 'api/index';
import { useMoveManyPlaylistItems } from 'hooks/playlistHooks';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { usePlaylist, usePlaylistItems } from 'queries/playlist-queries';
import { useNowPlaying } from 'queries/plex-queries';
import ScrollSeekPlaceholderNoIndex from 'routes/virtuoso-components/ScrollSeekPlaceholderNoIndex';
import { DragTypes } from 'types/enums';
import { RouteParams } from 'types/interfaces';
import Footer from './Footer';
import Header from './Header';
import List from './List';
import Row from './Row';

export interface PlaylistContext {
  dropIndex: React.MutableRefObject<number | null>;
  filter: string;
  getFormattedTime: (inMs: number) => string;
  handleDrop: (array: any[], index: number | null, itemType: null | string | symbol) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  items: PlaylistItem[];
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  playlist: PlaylistType | undefined;
  playPlaylist:
    (playlist: PlaylistType, shuffle?: boolean, key?: string | undefined) => Promise<void>;
  queryClient: QueryClient;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  sort: string;
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
  const queryClient = useQueryClient();
  const scrollCount = useRef(0);
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [sort, setSort] = useState('index:desc');
  const [filter, setFilter] = useState('');
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playPlaylist } = usePlayback();

  const items = useMemo(() => {
    if (!playlistItems.data) {
      return [];
    }
    let newItems = structuredClone(playlistItems.data);
    if (filter !== '') {
      newItems = newItems.filter(
        (item) => item.track.title?.toLowerCase().includes(filter.toLowerCase())
        || item.track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
        || item.track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
        || item.track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
      );
    }
    const [by, order] = sort.split(':') as [keyof Track, 'asc' | 'desc'];
    if (by === 'index') {
      return newItems;
    }
    if (order === 'asc') {
      inPlaceSort(newItems).asc((item) => item.track[by]);
    }
    if (order === 'desc') {
      inPlaceSort(newItems).desc((item) => item.track[by]);
    }
    return newItems;
  }, [filter, sort, playlistItems.data]);

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

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [id, queryClient]);

  const handleContainerDrop = () => {
    dropIndex.current = -1;
  };

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

  const playlistContext: PlaylistContext = useMemo(() => ({
    dropIndex,
    filter,
    getFormattedTime,
    handleDrop,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playlist: playlist.data,
    playPlaylist,
    queryClient,
    setFilter,
    setSort,
    sort,
  }), [
    dropIndex,
    filter,
    getFormattedTime,
    handleDrop,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playlist.data,
    playPlaylist,
    queryClient,
    setFilter,
    setSort,
    sort,
  ]);

  if (playlist.isLoading || playlistItems.isLoading) {
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
      onDropCapture={handleContainerDrop}
    >
      <Virtuoso
        className="scroll-container"
        components={{
          Footer,
          Header,
          List,
          ScrollSeekPlaceholder: ScrollSeekPlaceholderNoIndex,
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
  );
};

export default Playlist;
