import { useQuery } from '@tanstack/react-query';
import { Album, Artist, Hub, Library } from 'hex-plex';
import {
  artistAppearancesQueryFn,
  artistByGenreQueryFn,
  artistQueryFn,
  artistTracksQueryFn,
} from 'queries/artist-query-fns';
import { QueryKeys } from 'types/enums';
import { IConfig } from 'types/interfaces';

export interface ArtistQueryData {
  albums: Album[],
  artist: Artist,
  hubs: Hub[],
}

export const useArtist = (id: number, library: Library) => useQuery(
  [QueryKeys.ARTIST, id],
  () => artistQueryFn(id, library),
  {
    enabled: id !== -1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    retry: false,
  },
);

export const useArtistAppearances = (
  config: IConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
) => useQuery(
  [QueryKeys.ARTIST_APPEARANCES, id],
  () => artistAppearancesQueryFn(config, library, id, title, guid),
  {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);

export const useArtistTracks = ({
  config, library, id, title, guid, sort, removeDupes, slice,
}: {
  config: IConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
  sort: string,
  removeDupes?: boolean,
  slice?: number,
}) => useQuery(
  [QueryKeys.ARTIST_TRACKS, id, slice, sort],
  () => artistTracksQueryFn({
    config, library, id, title, guid, sort, removeDupes, slice,
  }),
  {
    enabled: id !== -1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);

export const useArtists = ({
  config, library,
}: {
  config: IConfig,
  library: Library,
}) => useQuery(
  [QueryKeys.ARTISTS],
  () => library.artists(config.sectionId!, { sort: 'titleSort:asc' }),
  {
    enabled: !!config && !!library,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    select: (data) => data.artists,
  },
);

export const useArtistsByGenre = ({
  fastKey, library, limit, sort,
}: {
  fastKey: string,
  library: Library,
  limit: number,
  sort: string,
}) => useQuery(
  [QueryKeys.ARTISTS, fastKey, limit, sort],
  () => artistByGenreQueryFn(fastKey, library, limit, sort),
  {
    enabled: !!library,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  },
);
