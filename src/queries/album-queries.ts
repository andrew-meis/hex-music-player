import { useQuery } from '@tanstack/react-query';
import { Library, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { uniqBy } from 'lodash';
import { albumQueryFn, albumSearchQueryFn, albumTracksQueryFn } from 'queries/album-query-fns';
import { topLibraryQueryFn } from 'queries/library-query-fns';
import { QueryKeys } from 'types/enums';
import { AppConfig } from 'types/interfaces';

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
  config: AppConfig,
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

export const useAlbumsByGenre = ({
  config, id, library, limit, sort,
}: {
  config: AppConfig,
  id: number,
  library: Library,
  limit: number,
  sort: string,
}) => useQuery(
  [QueryKeys.ALBUMS_BY_GENRE, id, limit, sort],
  () => library.albums(config.sectionId!, {
    genre: id,
    sort,
    ...(limit && { limit }),
  }),
  {
    enabled: !!library,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => data.albums,
  },
);

export const useTopAlbums = (
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
