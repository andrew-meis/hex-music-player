import { useQuery } from '@tanstack/react-query';
import { Album, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { uniqBy } from 'lodash';
import { useGetAlbum, useGetAlbumQuery } from 'hooks/albumHooks';
import { useGetTop } from 'hooks/plexHooks';
import { useLibrary } from 'queries/app-queries';

export const useAlbum = (albumId: Album['id']) => {
  const getAlbum = useGetAlbum();
  return useQuery(
    ['album', albumId],
    () => getAlbum(albumId),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
};

export const useAlbumQuery = (query: Record<string, string>) => {
  const getAlbumQuery = useGetAlbumQuery();
  return useQuery(
    ['albums', query],
    () => getAlbumQuery(query),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useAlbumTracks = (albumId: Album['id']) => {
  const library = useLibrary();
  return useQuery(
    ['album-tracks', albumId],
    () => library.albumTracks(albumId).then((r) => {
      const { tracks } = r;
      return tracks;
    }),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useTopAlbums = (
  { limit, start, end, seconds }: { limit: number, start?: number, end?: number, seconds?: number },
) => {
  const library = useLibrary();
  const type = 9;
  const topAlbums = useGetTop({ type, limit, seconds, start, end });
  return useQuery(
    ['top', { type, limit, seconds, start, end }],
    () => topAlbums().then((response) => {
      if (!response) {
        return undefined;
      }
      const { albums } = parseContainerType(MediaType.ALBUM, response.data);
      return uniqBy(albums, 'guid');
    }),
    {
      enabled: !!library,
      keepPreviousData: true,
      refetchInterval: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  );
};
