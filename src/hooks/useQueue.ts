import { useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { parsePlayQueue } from 'hex-plex/dist/types/play-queue';
import { useCallback } from 'react';
import useToast from 'hooks/useToast';
import {
  appQueryKeys,
  useAccount, useLibrary, useQueueId, useServer,
} from 'queries/app-queries';
import { QueryKeys } from 'types/enums';
import type {
  Album, PlayQueue, PlayQueueItem, Track,
} from 'hex-plex';
import type { IConfig } from 'types/interfaces';

const useQueue = () => {
  const account = useAccount();
  const library = useLibrary();
  const queryClient = useQueryClient();
  const server = useServer();
  const toast = useToast();
  const queueId = useQueueId();

  const addToQueue = useCallback(async ({
    newTracks,
    sendToast,
    after = 0,
    end = false,
    next = false,
  }: {
    newTracks: Album | Track | Track[],
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
    const response = await axios.put(url);
    if (!sendToast) {
      return parsePlayQueue(response.data);
    }
    toast({ type: 'info', text: 'Added to queue' });
    return parsePlayQueue(response.data);
  }, [account.client.identifier, library, queueId, server.clientIdentifier, toast]);

  const setQueueId = useCallback(async (id: number) => {
    const newConfig = queryClient.setQueryData(
      appQueryKeys.config,
      (oldData: IConfig | undefined): IConfig | undefined => (
        { ...oldData as IConfig, queueId: id }
      ),
    );
    window.electron.writeConfig('config', newConfig);
  }, [queryClient]);

  const getQueue = useCallback(async (
    id: number | undefined = queueId,
    center: number | undefined = undefined,
  ) => {
    const url = library.api.getAuthenticatedUrl(
      `/playQueues/${id}`,
      {
        window: 30,
        ...(center && { center }),
      },
    );
    const response = await axios.get(url as string);
    return parsePlayQueue(response.data);
  }, [library, queueId]);

  const playQueue = useCallback(async (uri: string, shuffle: boolean, key?: string | undefined) => {
    let newQueue = await library.createQueue({ uri, key, shuffle });
    await setQueueId(newQueue.id);
    newQueue = await getQueue(newQueue.id);
    return newQueue;
  }, [getQueue, library, setQueueId]);

  const removeFromQueue = useCallback(async (queueItemId: PlayQueueItem['id']) => {
    const url = library.api.getAuthenticatedUrl(
      `/playQueues/${queueId}/items/${queueItemId}`,
    );
    const response = await axios.delete(url);
    return parsePlayQueue(response.data);
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
    setQueueId,
    getQueue,
    playQueue,
    removeFromQueue,
    toggleShuffle,
    updateQueue,
    updateTimeline,
  };
};

export default useQueue;
