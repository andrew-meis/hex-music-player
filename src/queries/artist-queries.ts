import { useQuery } from '@tanstack/react-query';
import { Album, Artist, Hub, Library } from 'api/index';
import { PlexSort, plexSort } from 'classes';
import {
  artistAppearancesQueryFn,
  artistQueryFn,
  artistTracksQueryFn,
} from 'queries/artist-query-fns';
import { ArtistSortKeys, QueryKeys, SortOrders } from 'types/enums';
import { AppConfig } from 'types/interfaces';

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
  config: AppConfig,
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
  config: AppConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
  sort: PlexSort,
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
  config: AppConfig,
  library: Library,
}) => useQuery(
  [QueryKeys.ARTISTS],
  () => library.artists(config.sectionId!, {
    sort: plexSort(ArtistSortKeys.TITLE, SortOrders.ASC).stringify(),
  }),
  {
    enabled: !!config && !!library,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
    select: (data) => data.artists,
  },
);

// TODO unused
export const useArtistsByGenre = ({
  config, id, library, limit, sort,
}: {
  config: AppConfig,
  id: number,
  library: Library,
  limit: number,
  sort: PlexSort,
}) => useQuery(
  [QueryKeys.ARTISTS_BY_GENRE, id, limit, sort],
  () => library.artists(config.sectionId!, {
    genre: id,
    sort: sort.stringify(),
    ...(limit && { limit }),
  }),
  {
    enabled: !!library,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    select: (data) => data.artists,
  },
);
