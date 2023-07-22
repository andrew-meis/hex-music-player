import { useAtomValue } from 'jotai';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import { Album, Artist, PlayQueueItem, Track } from 'api/index';
import usePlayback from 'hooks/usePlayback';
import useQueue from 'hooks/useQueue';
import { usePlayerContext } from 'root/Player';
import { libraryAtom, queueIdAtom } from 'root/Root';
import { isAlbum, isArtist, isTrack } from 'types/type-guards';

const useDragActions = () => {
  const library = useAtomValue(libraryAtom);
  const player = usePlayerContext();
  const queueId = useAtomValue(queueIdAtom);
  const { addToQueue, getQueue, removeFromQueue, updateQueue } = useQueue();
  const { playAlbum, playArtist, playTracks } = usePlayback();

  const addLast = useCallback(async (dragItems: (Album | Artist | Track)[]) => {
    if (isEmpty(dragItems)) return;
    if (!queueId && isAlbum(dragItems[0])) {
      const [album] = dragItems as Album[];
      await playAlbum(album);
      return;
    }
    if (!queueId && isArtist(dragItems[0])) {
      const [artist] = dragItems as Artist[];
      await playArtist(artist);
      return;
    }
    if (!queueId && isTrack(dragItems[0])) {
      const tracks = dragItems as Track[];
      await playTracks(tracks);
      return;
    }
    if (isAlbum(dragItems[0])) {
      const [album] = dragItems as Album[];
      const newQueue = await addToQueue({
        newTracks: album,
        sendToast: true,
        end: true,
      });
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
      return;
    }
    if (isArtist(dragItems[0])) {
      const [artist] = dragItems as Artist[];
      const newQueue = await addToQueue({
        newTracks: artist,
        sendToast: true,
        end: true,
      });
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
      return;
    }
    if (isTrack(dragItems[0])) {
      const tracks = dragItems as Track[];
      const newQueue = await addToQueue({
        newTracks: tracks,
        sendToast: true,
        end: true,
      });
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
    }
  }, [addToQueue, playAlbum, playArtist, playTracks, player, queueId, updateQueue]);

  const addMany = useCallback(async (
    dragItems: (Album | Artist | Track)[],
    afterId: PlayQueueItem['id'],
  ) => {
    if (isEmpty(dragItems)) return;
    if (!queueId && isAlbum(dragItems[0])) {
      const [album] = dragItems as Album[];
      await playAlbum(album);
      return;
    }
    if (!queueId && isArtist(dragItems[0])) {
      const [artist] = dragItems as Artist[];
      await playArtist(artist);
      return;
    }
    if (!queueId && isTrack(dragItems[0])) {
      const tracks = dragItems as Track[];
      await playTracks(tracks);
      return;
    }
    if (isAlbum(dragItems[0])) {
      const [album] = dragItems as Album[];
      const newQueue = await addToQueue({
        newTracks: album,
        sendToast: true,
        after: afterId,
      });
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
      return;
    }
    if (isArtist(dragItems[0])) {
      const [artist] = dragItems as Artist[];
      const newQueue = await addToQueue({
        newTracks: artist,
        sendToast: true,
        after: afterId,
      });
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
      return;
    }
    if (isTrack(dragItems[0])) {
      const tracks = dragItems as Track[];
      const newQueue = await addToQueue({
        newTracks: tracks,
        sendToast: true,
        after: afterId,
      });
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
    }
  }, [addToQueue, playAlbum, playArtist, playTracks, player, queueId, updateQueue]);

  const moveLast = useCallback(async (item: PlayQueueItem) => {
    await removeFromQueue(item.id);
    await addToQueue({
      newTracks: item.track,
      sendToast: false,
      end: true,
    });
  }, [addToQueue, removeFromQueue]);

  const moveManyLast = useCallback(async (items: PlayQueueItem[]) => {
    const promises = items.map((queueItem) => moveLast(queueItem));
    await Promise.all(promises);
    const newQueue = await getQueue();
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [getQueue, moveLast, player, updateQueue]);

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

  const moveNext = useCallback(async (
    queueItemId: PlayQueueItem['id'],
    afterId: PlayQueueItem['id'],
  ) => {
    if (queueId) {
      await library.movePlayQueueItem(queueId, queueItemId, afterId);
      const newQueue = await getQueue();
      await updateQueue(newQueue);
      player.updateTracks(newQueue, 'update');
    }
  }, [getQueue, library, player, queueId, updateQueue]);

  const removeMany = useCallback(async (itemsToRemove: PlayQueueItem[]) => {
    const promises = itemsToRemove.map((item) => removeFromQueue(item.id));
    await Promise.all(promises);
    const newQueue = await getQueue();
    await updateQueue(newQueue);
    player.updateTracks(newQueue, 'update');
  }, [getQueue, player, removeFromQueue, updateQueue]);

  return {
    addLast,
    addMany,
    moveLast,
    moveMany,
    moveManyLast,
    moveNext,
    removeMany,
  };
};

export default useDragActions;
