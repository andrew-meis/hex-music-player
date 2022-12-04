import { useQuery } from '@tanstack/react-query';
import { Library } from 'hex-plex';
import {
  artistAppearancesQueryFn,
  artistQueryFn,
  artistTracksQueryFn,
} from 'queries/artist-query-fns';
import { IConfig } from 'types/interfaces';

export const useArtist = (id: number, library: Library) => useQuery(
  ['artist', id],
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
  ['artist-appearances', id],
  () => artistAppearancesQueryFn(config, library, id, title, guid),
  {
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);

export const useArtistTracks = ({
  config, library, id, title, guid, slice, limit,
}: {
  config: IConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
  slice?: number,
  limit?: number,
}) => useQuery(
  ['artist-tracks', id, slice],
  () => artistTracksQueryFn({
    config, library, id, title, guid, slice, limit,
  }),
  {
    enabled: id !== -1,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  },
);
