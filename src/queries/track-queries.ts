import { useQuery } from '@tanstack/react-query';
import { Library, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { uniqBy } from 'lodash';
import { topLibraryQueryFn } from 'queries/library-query-fns';
import { IConfig } from 'types/interfaces';

// eslint-disable-next-line import/prefer-default-export
export const useTopTracks = (
  {
    config, library, limit, start, end, seconds,
  } : {
    config: IConfig, library: Library, limit: number, start?: number, end?: number, seconds?: number
  },
) => useQuery(
  ['top', { type: 10, limit, seconds, start, end }],
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
