import Prism from '@zwolf/prism';
import { schema } from 'normalizr';
import { Media, toMedia } from './media';
import { MediaContainer, toMediaContainer } from './media-container';
import { createParser } from './parser';

import { Tag, toTagList } from './tag';
import { toNumber, toDateFromSeconds, toFloat } from './types';

const trackSchema = new schema.Entity('tracks');

const trackContainerSchema = new schema.Object({
  tracks: new schema.Array(trackSchema),
});

export interface Track {
  _type: string,
  id: number,
  parentId: number,
  grandparentId: number,

  mbid: Tag[],
  media: Media[],

  plexMix: unknown,

  addedAt: Date,
  art: string,
  deletedAt: Date,
  duration: number,
  globalViewCount: number,
  grandparentArt: string,
  grandparentGuid: string,
  grandparentKey: string,
  grandparentRatingKey: string,
  grandparentThumb: string,
  grandparentTitle: string,
  guid: string,
  index: number,
  key: string,
  lastRatedAt: Date,
  lastViewedAt: Date,
  librarySectionId: number,
  librarySectionKey: string,
  librarySectionTitle: string,
  originalTitle: string,
  parentGuid: string,
  parentIndex: number,
  parentKey: string,
  parentRatingKey: string,
  parentStudio: string,
  parentThumb: string,
  parentTitle: string,
  parentYear: number,
  ratingCount: number,
  ratingKey: string,
  score: number,
  summary: string,
  thumb: string,
  title: string,
  titleSort: string,
  trackNumber: number,
  type: string,
  updatedAt: Date,
  userRating: number,
  viewCount: number,
}

const toTrack = ($data: Prism<any>): Track => ({
  _type: 'track',

  id: $data.get<string>('ratingKey').transform(toNumber).value,
  parentId: $data.get<string>('parentRatingKey').transform(toNumber).value,
  grandparentId: $data.get<string>('grandparentRatingKey').transform(toNumber)
    .value,

  mbid: $data.get('Guid', { quiet: true }).transform(toTagList).value,
  media: $data
    .get('Media')
    .toArray()
    .map(toMedia),

  plexMix: $data
    .get('Related', { quiet: true })
    .get('Directory', { quiet: true }).value,

  addedAt: $data.get<number>('addedAt').transform(toDateFromSeconds).value,
  art: $data.get<string>('art').value,
  deletedAt: $data
    .get<number>('deletedAt', { quiet: true })
    .transform(toDateFromSeconds).value,
  duration: $data.get<number>('duration').value,
  globalViewCount: $data.get<number>('globalViewCount').value,
  grandparentArt: $data.get<string>('grandparentArt').value,
  grandparentKey: $data.get<string>('grandparentKey').value,
  grandparentRatingKey: $data.get<string>('grandparentRatingKey').value,
  grandparentThumb: $data.get<string>('grandparentThumb', { quiet: true }).value,
  grandparentTitle: $data.get<string>('grandparentTitle').value,
  grandparentGuid: $data.get<string>('grandparentGuid', { quiet: true }).value,
  guid: $data.get<string>('guid', { quiet: true }).value,
  index: $data.get<number>('index', { quiet: true }).value,
  key: $data.get<string>('key').value,
  lastRatedAt: $data
    .get<number>('lastRatedAt', { quiet: true })
    .transform(toDateFromSeconds).value,
  lastViewedAt: $data
    .get<number>('lastViewedAt', { quiet: true })
    .transform(toDateFromSeconds).value,
  librarySectionId: $data.get<number>('librarySectionId').value,
  librarySectionKey: $data.get<string>('librarySectionKey').value,
  librarySectionTitle: $data.get<string>('librarySectionTitle').value,
  originalTitle: $data.get<string>('originalTitle', { quiet: true }).value,
  parentGuid: $data.get<string>('parentGuid', { quiet: true }).value,
  parentIndex: $data.get<number>('parentIndex', { quiet: true }).value,
  parentKey: $data.get<string>('parentKey').value,
  parentRatingKey: $data.get<string>('parentRatingKey').value,
  parentStudio: $data.get<string>('parentStudio').value,
  parentThumb: $data.get<string>('parentThumb', { quiet: true }).value,
  parentTitle: $data.get<string>('parentTitle').value,
  parentYear: $data.get<number>('parentYear').value,
  ratingCount: $data.get<number>('ratingCount', { quiet: true }).value,
  ratingKey: $data.get<string>('ratingKey').value,
  score: $data.get<string>('score').transform(toFloat).value,
  summary: $data.get<string>('summary', { quiet: true }).value,
  thumb: $data.get<string>('thumb', { quiet: true }).value,
  title: $data.get<string>('title').value,
  titleSort: $data.get<string>('titleSort', { quiet: true }).value,
  trackNumber: $data.get<number>('index', { quiet: true }).value,
  type: $data.get<string>('type').value,
  updatedAt: $data
    .get<number>('updatedAt', { quiet: true })
    .transform(toDateFromSeconds).value,
  userRating: $data.get<number>('userRating', { quiet: true }).value,
  viewCount: $data.get<number>('viewCount', { quiet: true }).value,
});

export interface TrackContainer extends MediaContainer {
  _type: string,
  tracks: Track[],
  allowSync: string,
  art: string,
  grandparentRatingKey: string,
  grandparentThumb: string,
  grandparentTitle: string,
  key: string,
  librarySectionID: string,
  librarySectionTitle: string,
  librarySectionUUID: string,
  nocache: string,
  parentIndex: string,
  parentTitle: string,
  parentYear: string,
  thumb: string,
  title1: string,
  title2: string,
  viewGroup: string,
  viewMode: string,
}

const toTrackContainer = ($data: Prism<any>): TrackContainer => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  return {
    ...$data.transform(toMediaContainer).value,

    _type: 'trackContainer',

    tracks: $data
      .get('Metadata', { quiet: true })
      .toArray()
      .map(toTrack),

    allowSync: $data.get('allowSync').value,
    art: $data.get('art', { quiet: true }).value,
    grandparentRatingKey: $data.get('grandparentRatingKey', { quiet: true })
      .value,
    grandparentThumb: $data.get('grandparentThumb', { quiet: true }).value,
    grandparentTitle: $data.get('grandparentTitle', { quiet: true }).value,
    key: $data.get('key', { quiet: true }).value,
    librarySectionID: $data.get('librarySectionID').value,
    librarySectionTitle: $data.get('librarySectionTitle').value,
    librarySectionUUID: $data.get('librarySectionUUID').value,
    nocache: $data.get('nocache', { quiet: true }).value,
    parentIndex: $data.get('parentIndex', { quiet: true }).value,
    parentTitle: $data.get('parentTitle', { quiet: true }).value,
    parentYear: $data.get('parentYear', { quiet: true }).value,
    thumb: $data.get('thumb', { quiet: true }).value,
    title1: $data.get('title1', { quiet: true }).value,
    title2: $data.get('title2', { quiet: true }).value,
    viewGroup: $data.get('viewGroup', { quiet: true }).value,
    viewMode: $data.get('viewMode', { quiet: true }).value,
  };
};

const parseTrackContainer = createParser('trackContainer', toTrackContainer);

export {
  trackSchema,
  trackContainerSchema,
  toTrack,
  toTrackContainer,
  parseTrackContainer,
};
