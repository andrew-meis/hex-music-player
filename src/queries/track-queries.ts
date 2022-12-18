import { useQuery } from '@tanstack/react-query';
import { Library, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { uniqBy } from 'lodash';
import { topLibraryQueryFn } from 'queries/library-query-fns';
import { QueryKeys } from 'types/enums';
import { IConfig } from 'types/interfaces';
import { trackHistoryQueryFn } from './track-query-fns';

// eslint-disable-next-line import/prefer-default-export
export const useTopTracks = (
  {
    config, library, limit, start, end, seconds,
  } : {
    config: IConfig, library: Library, limit: number, start?: number, end?: number, seconds?: number
  },
) => useQuery(
  [QueryKeys.TOP, { type: 10, limit, seconds, start, end }],
  async () => {
    const response = await topLibraryQueryFn({
      type: 10, config, library, limit, start, end, seconds,
    });
    if (!response) return undefined;
    const { tracks } = parseContainerType(MediaType.TRACK, response.data);
    return uniqBy(tracks, 'guid');
  },
  {
    keepPreviousData: true,
    refetchInterval: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  },
);

export const useTrackHistory = (
  {
    config, library, id, days,
  } : {
    config: IConfig, library: Library, id: number, days: number
  },
) => useQuery(
  [QueryKeys.HISTORY, { id, days }],
  () => trackHistoryQueryFn(config, library, id, days),
  {
    initialData: [],
    keepPreviousData: true,
    refetchOnWindowFocus: false,
  },
);
