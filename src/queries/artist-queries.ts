import { useQuery } from '@tanstack/react-query';
import { Album, Artist, Hub, Library } from 'hex-plex';
import {
  artistAppearancesQueryFn,
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
  config, library, id, title, guid, sort, slice,
}: {
  config: IConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
  sort: string,
  slice?: number,
}) => useQuery(
  [QueryKeys.ARTIST_TRACKS, id, slice, sort],
  () => artistTracksQueryFn({
    config, library, id, title, guid, sort, slice,
  }),
  {
    enabled: id !== -1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);
