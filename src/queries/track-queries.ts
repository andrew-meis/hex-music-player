import { useQuery } from '@tanstack/react-query';
import { uniqBy } from 'lodash';
import { Library, MediaType, Track, parseContainerType } from 'api/index';
import { PlexSort } from 'classes/index';
import { topLibraryQueryFn } from 'queries/library-query-fns';
import { QueryKeys } from 'types/enums';
import { AppConfig } from 'types/interfaces';
import { recentTracksQueryFn, similarTracksQueryFn, trackHistoryQueryFn } from './track-query-fns';

export const useRecentTracks = (
  {
    config, library, id, days,
  } : {
    config: AppConfig, library: Library, id: number, days: number
  },
) => useQuery(
  [QueryKeys.RECENT_TRACKS, { id, days }],
  () => recentTracksQueryFn(config, library, id, days),
  {
    initialData: [],
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  },
);

export const useSimilarTracks = (
  {
    library, track,
  } : {
    library: Library, track: Track | undefined,
  },
) => useQuery(
  [QueryKeys.SIMILAR_TRACKS, track?.id],
  () => similarTracksQueryFn(library, track!),
  {
    enabled: !!track,
    initialData: [],
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  },
);

export const useTopTracks = (
  {
    config, library, limit, start, end, seconds,
  } : {
    config: AppConfig,
    library: Library,
    limit: number,
    start?: number,
    end?: number,
    seconds?: number,
  },
) => useQuery(
  [QueryKeys.TOP, { type: 10, limit, seconds, start, end }],
  async () => {
    const response = await topLibraryQueryFn({
      type: 10, config, library, limit, start, end, seconds,
    });
    if (!response) return undefined;
    const { tracks } = parseContainerType(MediaType.TRACK, response);
    return uniqBy(tracks, 'guid');
  },
  {
    keepPreviousData: true,
    refetchInterval: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  },
);

export const useTrack = (
  {
    library, id,
  } : {
    library: Library, id: number,
  },
) => useQuery(
  [QueryKeys.TRACK, id],
  () => library.track(id),
  {
    refetchOnWindowFocus: false,
    select: (data) => data.tracks[0],
  },
);

export const useTrackHistory = (
  {
    config, library, id,
  } : {
    config: AppConfig, library: Library, id: number,
  },
) => useQuery(
  [QueryKeys.HISTORY, { id }],
  () => trackHistoryQueryFn(config, library, id),
  {
    initialData: [],
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  },
);

export const useTracksByGenre = ({
  albumIds, config, id, library, limit, sort,
}: {
  albumIds: number[];
  config: AppConfig,
  id: number;
  library: Library,
  limit: number,
  sort: PlexSort,
}) => useQuery(
  [QueryKeys.TRACKS_BY_GENRE, id, limit, sort],
  () => library.tracks(config.sectionId!, {
    'album.id': albumIds.join(','),
    sort: sort.stringify(),
    ...(limit && { limit }),
  }),
  {
    enabled: !!library && albumIds.length > 0,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => data.tracks,
  },
);
