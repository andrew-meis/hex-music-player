import { Typography } from '@mui/material';
import { CellContext, SortingState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { isEmpty } from 'lodash';
import moment from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Album, Track } from 'api/index';
import { PlexSort } from 'classes';
import usePlayback from 'hooks/usePlayback';
import {
  useArtist,
  useArtistAppearances,
  useArtistTracks,
} from 'queries/artist-queries';
import { configAtom, libraryAtom } from 'root/Root';
import { AppTrackViewSettings, LocationWithState, RouteParams } from 'types/interfaces';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import Header from './Header';
import TrackTable from './TrackTable';

const artistTracksSortingAtom = atom<SortingState>([]);

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastRatedAt: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    ratingCount: false,
    viewCount: true,
  },
  compact: false,
  multiLineRating: false,
  multiLineTitle: true,
};

const ArtistTracks = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation() as LocationWithState;
  const navigationType = useNavigationType();
  const setTableKey = useSetAtom(tableKeyAtom);
  const viewSettings = window.electron
    .readConfig('artist-tracks-view-settings') as AppTrackViewSettings;
  const [filter, setFilter] = useState('');
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const [sortingState, setSortingState] = useAtom(artistTracksSortingAtom);
  const { playTracks } = usePlayback();

  useEffect(() => {
    setTableKey('artist');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [sorting, setSorting] = useState<SortingState>(() => {
    if (navigationType === 'POP' && !isEmpty(sortingState)) {
      return sortingState;
    }
    return location.state.sorting;
  });
  const [sort] = sorting;

  const { data: artist, isLoading: artistLoading } = useArtist(+id, library);
  const { data: appearances, isLoading: appearancesLoading } = useArtistAppearances(
    config,
    library,
    +id,
    location.state.title,
    location.state.guid,
  );
  const { data: tracks, isLoading: tracksLoading } = useArtistTracks({
    config,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    removeDupes: false,
    sort: PlexSort.parseColumnSort(sort, 'track'),
  });

  useEffect(() => () => setSortingState(sorting), [setSortingState, sorting]);

  const additionalColumns = [{
    id: 'originallyAvailableAt',
    accessorFn: (track: Track) => track.originallyAvailableAt,
    cell: (info: CellContext<Track, Date>) => (moment.utc(info.getValue())
      .format('DD MMMM YYYY')),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Release Date
      </Typography>
    ),
  }];

  const albums: Album[] = useMemo(() => {
    const newAlbums = [];
    if (artist && appearances) {
      newAlbums.push(...artist.albums);
      artist.hubs.forEach((hub) => {
        if (hub.type === 'album') newAlbums.push(...hub.items as Album[]);
      });
      newAlbums.push(...appearances);
    }
    return newAlbums;
  }, [appearances, artist]);

  const items = useMemo(() => {
    if (!tracks || isEmpty(albums)) {
      return [];
    }
    const newTracks = tracks.map((track) => {
      const { originallyAvailableAt } = albums.find((album) => album.id === track.parentId)!;
      return Object.assign(track, { originallyAvailableAt });
    });
    if (filter === '') {
      return newTracks;
    }
    return newTracks.filter(
      (track) => track.title?.toLowerCase().includes(filter.toLowerCase())
      || track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }, [albums, filter, tracks]);

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

  if (artistLoading || appearancesLoading || tracksLoading) {
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
          `artist-tracks-scroll ${id}`,
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        artist={artist!.artist}
        filter={filter}
        handlePlayNow={handlePlayNow}
        setFilter={setFilter}
      />
      <TrackTable
        additionalColumns={additionalColumns}
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
        setSorting={setSorting}
        sorting={sorting}
        subtextOptions={{
          albumTitle: true,
          artistTitle: true,
          showSubtext: typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineTitle
            : defaultViewSettings.multiLineTitle,
        }}
        tableKey="artist"
      />
    </motion.div>
  );
};

export default ArtistTracks;
