import { useCallback } from 'react';
import { PlayQueueItem, Track } from 'hex-plex';
import { usePlayerContext } from '../core/Player';
import { useLibrary, useQueueId } from './queryHooks';
import usePlayback from './usePlayback';
import useQueue from './useQueue';

const useDragActions = () => {
  const library = useLibrary();
  const player = usePlayerContext();
  const { addToQueue, getQueue, removeFromQueue, updateQueue } = useQueue();
  const { data: queueId } = useQueueId();
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
    const newQueue = await addToQueue(dragItem, false, true);
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [addToQueue, playTrack, playTracks, player, queueId, updateQueue]);

  const addMany = useCallback(async (dragItems: Track[], afterId: PlayQueueItem['id']) => {
    if (!queueId) {
      await playTracks(dragItems);
      return;
    }
    const newTracksIds = dragItems.map((track) => track.id);
    const newQueue = await addToQueue(dragItems, true, false);
    const newQueueItemsIds = newQueue.items
      .filter((item) => newTracksIds.includes(item.track.id))
      .map((item) => item.id);
    // eslint-disable-next-line no-restricted-syntax
    for (const [index, id] of newQueueItemsIds.entries()) {
      if (index === 0) {
        // eslint-disable-next-line no-await-in-loop
        await library.movePlayQueueItem(queueId, id, afterId);
      }
      if (index > 0) {
        // eslint-disable-next-line no-await-in-loop
        await library.movePlayQueueItem(queueId, id, newQueueItemsIds[index - 1]);
      }
    }
    const finalQueue = await getQueue();
    await updateQueue(finalQueue);
    player.updateTracks(finalQueue, 'update');
  }, [addToQueue, getQueue, library, playTracks, player, queueId, updateQueue]);

  const addOne = useCallback(async (dragItem: Track, afterId: PlayQueueItem['id']) => {
    if (!queueId) {
      await playTrack(dragItem);
      return;
    }
    let newQueue = await addToQueue(dragItem, true, false);
    const queueItem = newQueue.items.find((item) => item.track.id === dragItem.id);
    newQueue = await library.movePlayQueueItem(queueId, queueItem!.id, afterId);
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [queueId, addToQueue, library, updateQueue, player, playTrack]);

  const moveLast = useCallback(async (dragItem: PlayQueueItem) => {
    await removeFromQueue(dragItem.id);
    const newQueue = await addToQueue(dragItem.track, false, true, true);
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
