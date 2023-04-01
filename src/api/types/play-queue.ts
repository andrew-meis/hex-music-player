import Prism from '@zwolf/prism';
import { schema } from 'normalizr';
import { toMediaContainer } from './media-container';
import { createParser } from './parser';

import { toTrack, Track, trackSchema } from './track';

const playQueueItemSchema = new schema.Object({
  track: trackSchema,
});

const playQueueContainerSchema = new schema.Object({
  items: new schema.Array(playQueueItemSchema),
});

export interface PlayQueueItem {
  _type: string,
  id: number,
  guid: string,
  librarySectionId: number,
  track: Track
}

export interface PlayQueue {
  _type: string,
  id: number,
  allowShuffle: boolean,
  lastAddedItemID: number,
  selectedItemId: number,
  selectedItemOffset: number,
  selectedMetadataItemId: string,
  shuffled: boolean,
  sourceURI: string,
  totalCount: number,
  version: number,
  items: PlayQueueItem[],
}

const toPlayQueueItem = ($data: Prism<any>): PlayQueueItem => ({
  _type: 'playQueueItem',
  id: $data.get('playQueueItemID').value,
  guid: $data.get('guid').value,
  librarySectionId: $data.get('librarySectionID').value,
  track: $data.transform(toTrack).value,
});

const toPlayQueue = ($data: Prism<any>): PlayQueue => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  return {
    ...$data.transform(toMediaContainer).value,

    _type: 'playQueueContainer',

    id: $data.get('playQueueID').value,
    allowShuffle: $data.get('allowShuffle').value,
    lastAddedItemID: $data.get('playQueueLastAddedItemID').value,
    selectedItemId: $data.get('playQueueSelectedItemID').value,
    selectedItemOffset: $data.get('playQueueSelectedItemOffset').value,
    selectedMetadataItemId: $data.get('playQueueSelectedMetadataItemID').value,
    shuffled: $data.get('playQueueShuffled').value,
    sourceURI: $data.get('playQueueSourceURI').value,
    totalCount: $data.get('playQueueTotalCount').value,
    version: $data.get('playQueueVersion').value,

    items: $data
      .get('Metadata')
      .toArray()
      .map(toPlayQueueItem),
  };
};

const parsePlayQueue = createParser('playQueue', toPlayQueue);

export {
  playQueueItemSchema,
  playQueueContainerSchema,
  toPlayQueueItem,
  toPlayQueue,
  parsePlayQueue,
};
