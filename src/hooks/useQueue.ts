import { useQueryClient } from '@tanstack/react-query';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import ky from 'ky';
import { useCallback } from 'react';
import {
  Album, Artist, PlayQueue, PlayQueueItem, Playlist, Track, parsePlayQueue,
} from 'api/index';
import { toastAtom } from 'components/toast/Toast';
import { accountAtom, libraryAtom, queueIdAtom, serverAtom, settingsAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';

const useQueue = () => {
  const account = useAtomValue(accountAtom);
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  const server = useAtomValue(serverAtom);
  const settings = useAtomValue(settingsAtom);
  const setToast = useSetAtom(toastAtom);
  const [queueId, setQueueId] = useAtom(queueIdAtom);

  const addToQueue = useCallback(async ({
    newTracks,
    sendToast,
    after = 0,
    end = false,
    next = false,
  }: {
    newTracks: Album | Artist | Playlist | Track | Track[],
    sendToast: boolean,
    after?: number,
    end?: boolean,
    next?: boolean,
  }) => {
    let uri;
    if (Array.isArray(newTracks)) {
      const ids = newTracks.map((track) => track.id).join(',');
      uri = library.buildLibraryURI(
        account.client.identifier,
        `/library/metadata/${ids}`,
      );
    } else {
      uri = `server://${server.clientIdentifier}/com.plexapp.plugins.library${newTracks.key}`;
    }
    const url = library.api.getAuthenticatedUrl(
      `/playQueues/${queueId}`,
      {
        uri,
        ...(after && { after }),
        ...(end && { end: 1 }),
        ...(next && { next: 1 }),
      },
    );
    const response = await ky.put(url).json() as Record<string, any>;
    if (!sendToast) {
      return parsePlayQueue(response);
    }
    setToast({ type: 'info', text: 'Added to queue' });
    return parsePlayQueue(response);
  }, [account.client.identifier, library, queueId, server.clientIdentifier, setToast]);

  const getQueue = useCallback(async (
    id: number | undefined = queueId,
    center: number | undefined = undefined,
  ) => {
    const url = library.api.getAuthenticatedUrl(
      `/playQueues/${id}`,
      {
        window: 30,
        ...(center && { center }),
        ...(settings.repeat === 'repeat-all' && { repeat: 1 }),
      },
    );
    const response = await ky(url).json() as Record<string, any>;
    return parsePlayQueue(response);
  }, [library.api, queueId, settings.repeat]);

  const createQueue = useCallback(async (
    uri: string,
    shuffle: boolean,
    key?: string | undefined,
  ) => {
    let newQueue = await library.createQueue({ uri, key, shuffle });
    setQueueId(newQueue.id);
    newQueue = await getQueue(newQueue.id);
    return newQueue;
  }, [getQueue, library, setQueueId]);

  const removeFromQueue = useCallback(async (queueItemId: PlayQueueItem['id']) => {
    const url = library.api.getAuthenticatedUrl(
      `/playQueues/${queueId}/items/${queueItemId}`,
    );
    const response = await ky.delete(url).json() as Record<string, any>;
    return parsePlayQueue(response);
  }, [library, queueId]);

  const toggleShuffle = useCallback(async (action: 'shuffle' | 'unshuffle') => {
    let response;
    if (action === 'shuffle') {
      response = await library.shufflePlayQueue(queueId);
      return response;
    }
    response = await library.unshufflePlayQueue(queueId);
    return response;
  }, [library, queueId]);

  const updateQueue = useCallback(async (queue: PlayQueue) => {
    queryClient.setQueryData([QueryKeys.PLAYQUEUE, queueId], queue);
  }, [queryClient, queueId]);

  const updateTimeline = useCallback((
    queueItemId: PlayQueueItem['id'],
    status: 'playing' | 'paused' | 'stopped',
    position: number,
    track: Track,
  ) => library.timeline({
    currentTime: position,
    duration: track.duration,
    key: track.key,
    playerState: status,
    queueItemId,
    ratingKey: track.ratingKey,
  }), [library]);

  return {
    addToQueue,
    getQueue,
    createQueue,
    removeFromQueue,
    toggleShuffle,
    updateQueue,
    updateTimeline,
  };
};

export default useQueue;
