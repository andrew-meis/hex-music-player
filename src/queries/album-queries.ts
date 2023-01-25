import { useQuery } from '@tanstack/react-query';
import { Library, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { uniqBy } from 'lodash';
import { albumQueryFn, albumSearchQueryFn, albumTracksQueryFn } from 'queries/album-query-fns';
import { topLibraryQueryFn } from 'queries/library-query-fns';
import { QueryKeys } from 'types/enums';
import { IConfig } from 'types/interfaces';

export const useAlbum = (id: number, library: Library) => useQuery(
  [QueryKeys.ALBUM, id],
  () => albumQueryFn(id, library),
  {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  },
);

export const useAlbumQuick = (library: Library, id?: number) => useQuery(
  [QueryKeys.ALBUM_QUICK, id],
  () => library.album(id!),
  {
    enabled: !!id,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    select: (data) => data.albums[0],
  },
);

export const useAlbumSearch = (
  config: IConfig,
  library: Library,
  searchParams: Record<string, string>,
) => useQuery(
  [QueryKeys.ALBUMS, searchParams],
  () => albumSearchQueryFn(config, library, searchParams),
  {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);

export const useAlbumTracks = (id: number, library: Library) => useQuery(
  [QueryKeys.ALBUM_TRACKS, id],
  () => albumTracksQueryFn(id, library),
  {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);

export const useTopAlbums = (
  {
    config, library, limit, start, end, seconds,
  } : {
    config: IConfig, library: Library, limit: number, start?: number, end?: number, seconds?: number
  },
) => useQuery(
  [QueryKeys.TOP, { type: 9, limit, seconds, start, end }],
  async () => {
    const response = await topLibraryQueryFn({
      type: 9, config, library, limit, start, end, seconds,
    });
    if (!response) return undefined;
    const { albums } = parseContainerType(MediaType.ALBUM, response.data);
    return uniqBy(albums, 'guid');
  },
  {
    keepPreviousData: true,
    refetchInterval: 1000 * 60 * 30,
    refetchOnWindowFocus: false,
  },
);
