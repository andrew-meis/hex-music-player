import { Box } from '@mui/material';
import { sort } from 'fast-sort';
import { motion } from 'framer-motion';
import { isEmpty } from 'lodash';
import { useCallback, useMemo, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import { Album, Track } from 'api/index';
import { plexSort } from 'classes';
import { WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtist, useArtistAppearances, useArtistTracks } from 'queries/artist-queries';
import TrackTable from 'routes/album/TrackTable';
import { PlayActions, SortOrders, TrackSortKeys } from 'types/enums';
import {
  RouteParams,
  LocationWithState,
  AlbumWithSection,
  AppTrackViewSettings,
} from 'types/interfaces';
import Header from './Header';
import ReleaseAvatar from './ReleaseAvatar';
import ReleaseHeader from './ReleaseHeader';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: false,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const Discography = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const config = useConfig();
  const library = useLibrary();
  const location = useLocation() as LocationWithState;
  const viewSettings = window.electron.readConfig('album-view-settings') as AppTrackViewSettings;
  const [activeRelease, setActiveRelease] = useState<AlbumWithSection>();
  const [filter, setFilter] = useState('All Releases');
  const [open, setOpen] = useState(false);
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playSwitch } = usePlayback();

  const { data: artist, isLoading: artistLoading } = useArtist(+id, library);
  const { data: appearances, isLoading: appearancesLoading } = useArtistAppearances(
    config.data,
    library,
    +id,
    location.state.title,
    location.state.guid,
  );
  const { data: tracks, isLoading: tracksLoading } = useArtistTracks({
    config: config.data,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    removeDupes: false,
    sort: plexSort(TrackSortKeys.RELEASE_DATE, SortOrders.DESC),
  });

  const [releases, filters]: [releases: AlbumWithSection[], filters: string[] ] = useMemo(() => {
    if (!artist || !appearances) {
      return [[], []];
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
    if (activeRelease === undefined
      || !allReleases.map(({ id: releaseId }) => releaseId).includes(activeRelease.id)) {
      setActiveRelease(allReleases[0] as AlbumWithSection);
    }
    return [allReleases as AlbumWithSection[], newFilters];
  }, [activeRelease, appearances, artist, filter]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (sortedItems && !isEmpty(sortedItems)) {
      playSwitch(PlayActions.PLAY_TRACKS, { key, tracks: sortedItems as Track[], shuffle });
      return;
    }
    playSwitch(PlayActions.PLAY_ALBUM, { album: activeRelease, key, shuffle });
  }, [activeRelease, playSwitch]);

  if (artistLoading || appearancesLoading || tracksLoading) {
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
        width={174}
      >
        {releases.map((release, index) => (
          <ReleaseAvatar
            index={index}
            isActiveRelease={activeRelease?.id === release.id}
            key={release.id}
            library={library}
            release={release}
            setActiveRelease={setActiveRelease}
          />
        ))}
      </Box>
      <Box
        className="scroll-container"
        flexGrow={1}
        height="calc(100% - 72px)"
        ref={setScrollRef}
        style={{ overflow: 'overlay' }}
      >
        {activeRelease && (
          <>
            <ReleaseHeader
              album={activeRelease}
              handlePlayNow={handlePlayNow}
              thumbSrc={library.api.getAuthenticatedUrl(
                '/photo/:/transcode',
                {
                  url: activeRelease.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
                },
              )}
              trackLength={tracks?.filter((track) => track.parentId === activeRelease.id)
                .length || 0}
            />
            <TrackTable
              columnOptions={
                isEmpty(viewSettings.columns)
                  ? defaultViewSettings.columns
                  : viewSettings.columns
              }
              groupBy="parentIndex"
              isViewCompact={
                typeof viewSettings.compact !== 'undefined'
                  ? viewSettings.compact
                  : defaultViewSettings.compact
              }
              library={library}
              multiLineRating={
                typeof viewSettings.multiLineRating !== 'undefined'
                  ? viewSettings.multiLineRating
                  : defaultViewSettings.multiLineRating
              }
              open={open}
              playbackFn={handlePlayNow}
              rows={tracks?.filter((track) => track.parentId === activeRelease.id) || []}
              scrollRef={scrollRef}
              setOpen={setOpen}
              subtextOptions={{
                albumTitle: false,
                artistTitle: true,
                showSubtext: typeof viewSettings.multiLineTitle !== 'undefined'
                  ? viewSettings.multiLineTitle
                  : defaultViewSettings.multiLineTitle,
              }}
            />
          </>
        )}
      </Box>
    </motion.div>
  );
};

export default Discography;
