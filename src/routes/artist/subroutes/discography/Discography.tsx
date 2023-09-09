import { Box } from '@mui/material';
import { sort } from 'fast-sort';
import { motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Album, Track } from 'api/index';
import { plexSort } from 'classes';
import { WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useArtist, useArtistAppearances, useArtistTracks } from 'queries/artist-queries';
import { configAtom, libraryAtom } from 'root/Root';
import { PlayActions, SortOrders, TrackSortKeys } from 'types/enums';
import {
  RouteParams,
  LocationWithState,
  AlbumWithSection,
  AppTrackViewSettings,
} from 'types/interfaces';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import Header from './Header';
import TrackTable from './TrackTable';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastRatedAt: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    ratingCount: false,
    thumb: false,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const Discography = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation() as LocationWithState;
  const setTableKey = useSetAtom(tableKeyAtom);
  const viewSettings = window.electron.readConfig('album-view-settings') as AppTrackViewSettings;
  const [filter, setFilter] = useState('All Releases');
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playSwitch } = usePlayback();

  useEffect(() => {
    setTableKey('album');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { data: artist, isLoading: artistLoading } = useArtist(+id, library);
  const { data: appearances, isLoading: appearancesLoading } = useArtistAppearances(
    config,
    library,
    +id,
    location.state.title,
    location.state.guid,
  );
  const { data: allTracks, isLoading: allTracksLoading } = useArtistTracks({
    config,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    removeDupes: false,
    sort: plexSort(TrackSortKeys.RELEASE_DATE, SortOrders.DESC),
  });

  const [releases, filters, tracks]: [
    releases: AlbumWithSection[], filters: string[], tracks: Track[]
  ] = useMemo(() => {
    if (!artist || !appearances || !allTracks) {
      return [[], [], []];
    }
    const newFilters: string[] = ['All Releases'];
    const { albums } = artist;
    const newAlbums = albums.map((album) => ({ ...album, section: 'Albums' }));
    if (newAlbums.length > 0) newFilters.push('Albums');
    const hubReleases = [] as Album[][];
    artist.hubs.forEach((hub) => {
      if (hub.type === 'album' && hub.size > 0) {
        const objs = hub.items.map((album) => ({ ...album, section: hub.title })) as Album[];
        newFilters.push(hub.title);
        hubReleases.push(objs);
      }
    });
    const appearsOn = appearances.map((album) => ({ ...album, section: 'Appears On' }));
    if (appearsOn.length > 0) newFilters.push('Appears On');
    let allReleases = [...newAlbums, ...hubReleases.flat(1), ...appearsOn] as AlbumWithSection[];
    if (filter === 'All Releases') {
      allReleases = allReleases.filter((release) => release.section !== 'Appears On');
    }
    if (filter !== 'All Releases') {
      allReleases = allReleases.filter((release) => release.section === filter);
    }
    allReleases = sort(allReleases).desc((release) => release.originallyAvailableAt);
    const allReleasesIds = allReleases.map((release) => release.id);
    const filteredTracks = allTracks.filter((track) => allReleasesIds.includes(track.parentId));
    return [allReleases as AlbumWithSection[], newFilters, filteredTracks];
  }, [appearances, artist, filter, allTracks]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (sortedItems && !isEmpty(sortedItems)) {
      playSwitch(PlayActions.PLAY_TRACKS, { key, tracks: sortedItems as Track[], shuffle });
      return;
    }
    playSwitch(PlayActions.PLAY_TRACKS, { key, tracks, shuffle });
  }, [playSwitch, tracks]);

  if (artistLoading || appearancesLoading || allTracksLoading) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
        height: '100%',
        margin: 'auto',
        width: WIDTH_CALC,
      }}
    >
      <Header
        artist={artist!.artist}
        filter={filter}
        filters={filters}
        library={library}
        setFilter={setFilter}
      />
      <Box
        className="scroll-container"
        height="calc(100% - 72px)"
        overflow="auto"
        ref={setScrollRef}
        width="100%"
      >
        <TrackTable
          columnOptions={
            typeof viewSettings !== 'undefined'
              ? viewSettings.columns
              : defaultViewSettings.columns
          }
          groupBy={['parentId', 'parentRatingKey', 'parentIndex']}
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
          releases={releases}
          rows={tracks || []}
          scrollRef={scrollRef}
          subtextOptions={{
            albumTitle: false,
            artistTitle: true,
            showSubtext: typeof viewSettings !== 'undefined'
              ? viewSettings.multiLineTitle
              : defaultViewSettings.multiLineTitle,
          }}
        />
      </Box>
    </motion.div>
  );
};

export default Discography;
