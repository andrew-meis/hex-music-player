import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import { Playlist, PlaylistItem } from 'hex-plex';
import useToast from 'hooks/useToast';
import { useLibrary, useServer } from 'queries/app-queries';

export const useAddToPlaylist = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();
  const server = useServer();
  const toast = useToast();
  return async (id: Playlist['id'], key: string) => {
    const response = await library.addToPlaylist(
      id,
      `server://${server.clientIdentifier}/com.plexapp.plugins.library${key}`,
    );
    if (response.MediaContainer.leafCountAdded > 0) {
      await queryClient.refetchQueries(['playlist', id]);
      toast({ type: 'success', text: 'Added to playlist' });
    }
    if (!response || response.MediaContainer.leafCountAdded === 0) {
      toast({ type: 'error', text: 'No items added to playlist' });
    }
  };
};

export const useCreatePlaylist = () => {
  const library = useLibrary();
  const server = useServer();
  return async (title: string): Promise<AxiosResponse> => {
    const url = library.api.getAuthenticatedUrl(
      '/playlists',
      {
        title,
        smart: 0,
        type: 'audio',
        uri: `server://${server.clientIdentifier}/com.plexapp.plugins.libraryundefined`,
      },
    );
    return axios.post(url);
  };
};

export const useDeletePlaylist = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();
  const toast = useToast();
  return async (id: number) => {
    await library.deletePlaylist(id);
    await queryClient.refetchQueries(['playlists']);
    toast({ type: 'error', text: 'Deleted playlist' });
  };
};

export const useRemoveFromPlaylist = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();
  const toast = useToast();
  return async (playlistId: Playlist['id'], itemId: PlaylistItem['id']) => {
    await library.removeFromPlaylist(playlistId, itemId);
    await queryClient.refetchQueries(['playlist', playlistId]);
    toast({ type: 'error', text: 'Removed from playlist' });
  };
};
