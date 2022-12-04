import { useQuery } from '@tanstack/react-query';
import { MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { uniqBy } from 'lodash';
import { useGetTop } from 'hooks/plexHooks';
import { useLibrary } from 'queries/app-queries';

// eslint-disable-next-line import/prefer-default-export
export const useTopTracks = (
  { limit, start, end, seconds }: { limit: number, start?: number, end?: number, seconds?: number },
) => {
  const library = useLibrary();
  const type = 10;
  const topTracks = useGetTop({ type, limit, seconds, start, end });
  return useQuery(
    ['top', { type, limit, seconds, start, end }],
    () => topTracks().then((response) => {
      if (!response) {
        return undefined;
      }
      const { tracks } = parseContainerType(MediaType.TRACK, response.data);
      return uniqBy(tracks, 'guid');
    }),
    {
      enabled: !!library,
      keepPreviousData: true,
      refetchInterval: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  );
};
