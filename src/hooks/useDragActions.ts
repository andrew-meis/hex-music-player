import { useCallback } from 'react';
import usePlayback from 'hooks/usePlayback';
import useQueue from 'hooks/useQueue';
import { useLibrary, useQueueId } from 'queries/app-queries';
import { usePlayerContext } from 'root/Player';
import type { PlayQueueItem, Track } from 'hex-plex';

const useDragActions = () => {
  const library = useLibrary();
  const player = usePlayerContext();
  const queueId = useQueueId();
  const { addToQueue, getQueue, removeFromQueue, updateQueue } = useQueue();
  const { playTrack, playTracks } = usePlayback();

  const addLast = useCallback(async (dragItem: Track | Track[]) => {
    if (!queueId && !Array.isArray(dragItem)) {
      await playTrack(dragItem);
      return;
    }
    if (!queueId && Array.isArray(dragItem)) {
      await playTracks(dragItem);
      return;
    }
    const newQueue = await addToQueue({
      newTracks: dragItem,
      sendToast: true,
      end: true,
    });
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [addToQueue, playTrack, playTracks, player, queueId, updateQueue]);

  const addMany = useCallback(async (dragItems: Track[], afterId: PlayQueueItem['id']) => {
    if (!queueId) {
      await playTracks(dragItems);
      return;
    }
    const newQueue = await addToQueue({
      newTracks: dragItems,
      sendToast: true,
      after: afterId,
    });
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [addToQueue, playTracks, player, queueId, updateQueue]);

  const addOne = useCallback(async (dragItem: Track, afterId: PlayQueueItem['id']) => {
    if (!queueId) {
      await playTrack(dragItem);
      return;
    }
    const newQueue = await addToQueue({
      newTracks: dragItem,
      sendToast: true,
      after: afterId,
    });
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [queueId, addToQueue, updateQueue, player, playTrack]);

  const moveLast = useCallback(async (dragItem: PlayQueueItem) => {
    await removeFromQueue(dragItem.id);
    const newQueue = await addToQueue({
      newTracks: dragItem.track,
      sendToast: false,
      end: true,
    });
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [addToQueue, player, removeFromQueue, updateQueue]);

  const moveMany = useCallback(async (queueItemIds: number[], afterId: PlayQueueItem['id']) => {
    if (queueId) {
      // eslint-disable-next-line no-restricted-syntax
      for (const [index, id] of queueItemIds.entries()) {
        if (index === 0) {
          // eslint-disable-next-line no-await-in-loop
          await library.movePlayQueueItem(queueId, id, afterId);
        }
        if (index > 0) {
          // eslint-disable-next-line no-await-in-loop
          await library.movePlayQueueItem(queueId, id, queueItemIds[index - 1]);
        }
      }
      const newQueue = await getQueue();
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
    }
  }, [getQueue, library, player, queueId, updateQueue]);

  const moveTrack = useCallback(async (
    queueItemId: PlayQueueItem['id'],
    afterId: PlayQueueItem['id'],
  ) => {
    if (queueId) {
      const newQueue = await library.movePlayQueueItem(queueId, queueItemId, afterId);
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
    }
  }, [library, player, queueId, updateQueue]);

  return {
    addLast,
    addMany,
    addOne,
    moveLast,
    moveMany,
    moveTrack,
  };
};

export default useDragActions;
