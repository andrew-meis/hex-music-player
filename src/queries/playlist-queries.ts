import { useQuery } from '@tanstack/react-query';
import { Playlist } from 'hex-plex';
import { useLibrary } from 'queries/app-queries';

export const usePlaylists = () => {
  const library = useLibrary();
  return useQuery(
    ['playlists'],
    () => library.playlists({ playlistType: 'audio' }),
    {
      enabled: !!library,
      refetchOnMount: false,
      select: (data) => data.playlists,
    },
  );
};

export const usePlaylist = (playlistId: Playlist['id']) => {
  const library = useLibrary();
  return useQuery(
    ['playlists'],
    () => library.playlists({ playlistType: 'audio' }),
    {
      enabled: !!library,
      refetchOnMount: true,
      select: (data) => data.playlists.find((playlist) => playlist.id === playlistId),
    },
  );
};

export const usePlaylistItems = (playlistId: Playlist['id']) => {
  const library = useLibrary();
  return useQuery(
    ['playlist', playlistId],
    () => library.playlistTracks(playlistId),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      select: (data) => data.items,
    },
  );
};
