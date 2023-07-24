import { motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEmpty } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Track } from 'api/index';
import { plexSort } from 'classes';
import { TrackTable } from 'components/track-table';
import usePlayback from 'hooks/usePlayback';
import { useAlbumsByGenre } from 'queries/album-queries';
import { useTracksByGenre } from 'queries/track-queries';
import { configAtom, libraryAtom } from 'root/Root';
import { AlbumSortKeys, SortOrders } from 'types/enums';
import { RouteParams, AppTrackViewSettings, LocationWithState } from 'types/interfaces';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import Header from './Header';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: true,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const GenreTracks: React.FC = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation() as LocationWithState;
  const navigationType = useNavigationType();
  const setTableKey = useSetAtom(tableKeyAtom);
  const viewSettings = window.electron
    .readConfig('genre-tracks-view-settings') as AppTrackViewSettings;
  const [filter, setFilter] = useState('');
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playTracks } = usePlayback();

  useEffect(() => {
    setTableKey('genre');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: albums, isLoading: albumsLoading } = useAlbumsByGenre({
    config,
    id: +id,
    library,
    limit: 0,
    sort: plexSort(AlbumSortKeys.PLAYCOUNT, SortOrders.DESC),
  });
  const { data: tracks, isLoading: tracksLoading } = useTracksByGenre({
    albumIds: albums?.map((album) => album.id) || [],
    config,
    id: +id,
    library,
    limit: -1,
    sort: plexSort(AlbumSortKeys.PLAYCOUNT, SortOrders.DESC),
  });

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

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`recent-favorites-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `recent-favorites-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (sortedItems && !isEmpty(sortedItems)) {
      playTracks(sortedItems, shuffle, key);
      return;
    }
    playTracks(items, shuffle, key);
  }, [items, playTracks]);

  if (albumsLoading || tracksLoading) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scroll-container"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      ref={setScrollRef}
      style={{ height: '100%', overflow: 'overlay' }}
      onAnimationComplete={() => scrollRef?.scrollTo({ top: initialScrollTop })}
      onScroll={(e) => {
        const target = e.currentTarget as unknown as HTMLDivElement;
        sessionStorage.setItem(
          `recent-favorites-scroll ${id}`,
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        filter={filter}
        setFilter={setFilter}
        title={location.state.title}
      />
      <TrackTable
        columnOptions={
          typeof viewSettings !== 'undefined'
            ? viewSettings.columns
            : defaultViewSettings.columns
        }
        isViewCompact={
          typeof viewSettings !== 'undefined'
            ? viewSettings.compact
            : defaultViewSettings.compact
        }
        library={library}
        multiLineRating={
          typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineRating
            : defaultViewSettings.multiLineRating
        }
        playbackFn={handlePlayNow}
        rows={items || []}
        scrollRef={scrollRef}
        subtextOptions={{
          albumTitle: true,
          artistTitle: true,
          showSubtext: typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineTitle
            : defaultViewSettings.multiLineTitle,
        }}
        tableKey="genre"
      />
    </motion.div>
  );
};

export default GenreTracks;
