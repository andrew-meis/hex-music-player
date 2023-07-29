import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { useAtomValue, useSetAtom } from 'jotai';
import ky from 'ky';
import { useCallback } from 'react';
import { parsePlaylistContainer, Playlist, PlaylistItem } from 'api/index';
import { toastAtom } from 'components/toast/Toast';
import { libraryAtom, serverAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';

const refetchPlaylistQueries = async (queryClient: QueryClient, id: number) => {
  await queryClient.refetchQueries([QueryKeys.PLAYLISTS]);
  await queryClient.refetchQueries([QueryKeys.PLAYLIST, id]);
  await queryClient.refetchQueries([QueryKeys.PLAYLIST_ITEMS, id]);
};

export const useAddToPlaylist = () => {
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  const server = useAtomValue(serverAtom);
  const setToast = useSetAtom(toastAtom);
  return async (id: Playlist['id'], idsToAdd: number[], quiet = false) => {
    const response = await library.addToPlaylist(
      id,
      // eslint-disable-next-line max-len
      `server://${server.clientIdentifier}/com.plexapp.plugins.library/library/metadata/${idsToAdd.join(',')}`,
    );
    if (quiet) return;
    if (response.MediaContainer.leafCountAdded > 0) {
      await refetchPlaylistQueries(queryClient, id);
      setToast({ type: 'success', text: 'Added to playlist' });
    }
    if (!response || response.MediaContainer.leafCountAdded === 0) {
      setToast({ type: 'error', text: 'No items added to playlist' });
    }
  };
};

export const useCreatePlaylist = () => {
  const library = useAtomValue(libraryAtom);
  const server = useAtomValue(serverAtom);
  return async (title: string) => {
    const url = library.api.getAuthenticatedUrl(
      '/playlists',
      {
        title,
        smart: 0,
        type: 'audio',
        uri: `server://${server.clientIdentifier}/com.plexapp.plugins.libraryundefined`,
      },
    );
    const response = await ky.post(url).json() as Record<string, any>;
    return parsePlaylistContainer(response);
  };
};

export const useDeletePlaylist = () => {
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);
  return async (id: number) => {
    await library.deletePlaylist(id);
    await queryClient.refetchQueries([QueryKeys.PLAYLISTS]);
    setToast({ type: 'error', text: 'Deleted playlist' });
  };
};

export const useMovePlaylistItems = () => {
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  return useCallback(async (playlistId: number, playlistItemIds: number[], afterId?: number) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, id] of playlistItemIds.entries()) {
      if (index === 0 && afterId) {
        // eslint-disable-next-line no-await-in-loop
        await library.movePlaylistItem(playlistId, id, afterId);
      }
      if (index === 0 && !afterId) {
        const url = library.api.getAuthenticatedUrl(`/playlists/${playlistId}/items/${id}/move`);
        // eslint-disable-next-line no-await-in-loop
        await ky.put(url);
      }
      if (index > 0) {
        // eslint-disable-next-line no-await-in-loop
        await library.movePlaylistItem(playlistId, id, playlistItemIds[index - 1]);
      }
    }
    await refetchPlaylistQueries(queryClient, playlistId);
  }, [library, queryClient]);
};

export const useRemoveFromPlaylist = () => {
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  const setToast = useSetAtom(toastAtom);
  return useCallback(async (playlistId: Playlist['id'], itemId: PlaylistItem['id']) => {
    await library.removeFromPlaylist(playlistId, itemId);
    await refetchPlaylistQueries(queryClient, playlistId);
    setToast({ type: 'error', text: 'Removed from playlist' });
  }, [library, queryClient, setToast]);
};
