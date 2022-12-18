import { useQuery } from '@tanstack/react-query';
import { Library } from 'hex-plex';
import { QueryKeys } from 'types/enums';

export const usePlaylists = (library: Library) => useQuery(
  [QueryKeys.PLAYLISTS],
  () => library.playlists({ playlistType: 'audio' }),
  {
    refetchOnMount: false,
    select: (data) => data.playlists,
  },
);

export const usePlaylist = (id: number, library: Library) => useQuery(
  [QueryKeys.PLAYLISTS],
  () => library.playlists({ playlistType: 'audio' }),
  {
    refetchOnMount: true,
    select: (data) => data.playlists.find((playlist) => playlist.id === id),
  },
);

export const usePlaylistItems = (id: number, library: Library) => useQuery(
  [QueryKeys.PLAYLIST, id],
  () => library.playlistTracks(id),
  {
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    select: (data) => data.items,
  },
);
