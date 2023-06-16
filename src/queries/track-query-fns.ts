import ky from 'ky';
import { countBy } from 'lodash';
import moment from 'moment';
import { Library, Track, parseTrackContainer } from 'api/index';
import { plexSort } from 'classes/index';
import { SortOrders, TrackSortKeys } from 'types/enums';
import { AppConfig } from 'types/interfaces';

export interface Playcount {
  historyKey: string;
  key: string;
  ratingKey: string;
  librarySectionID: string;
  parentKey: string;
  grandparentKey: string;
  title: string;
  parentTitle: string;
  grandparentTitle: string;
  type: string;
  thumb: string;
  parentThumb: string;
  grandparentThumb: string;
  grandparentArt: string;
  index: number;
  parentIndex: number;
  viewedAt: number;
  accountID: number;
  deviceID: number;
}

export const recentTracksQueryFn = async (
  config: AppConfig,
  library: Library,
  id: number,
  days: number,
) => {
  const time = moment();
  const url = library.api.getAuthenticatedUrl(
    '/status/sessions/history/all',
    {
      sort: plexSort(TrackSortKeys.VIEWED_AT, SortOrders.DESC).stringify(),
      librarySectionID: config.sectionId!,
      metadataItemID: id,
      'viewedAt<': time.unix(),
      'viewedAt>': time.subtract(days, 'day').unix(),
      accountID: 1,
    },
  );
  const response = await ky(url).json() as Record<string, any>;
  if (response.MediaContainer.size === 0) {
    return [];
  }
  const keys = response.MediaContainer.Metadata.map((record: Track) => record.ratingKey);
  const counts = countBy(keys, Math.floor);
  const { tracks } = await library.tracks(
    config?.sectionId!,
    { 'track.id': Object.keys(counts) as any },
  );
  if (tracks.length > 0) {
    Object.keys(counts).forEach((key) => {
      const match = tracks.find((track) => track.ratingKey === key);
      if (match) match.globalViewCount = counts[key];
    });
    return tracks.sort((a, b) => b.globalViewCount - a.globalViewCount);
  }
  return [];
};

export const similarTracksQueryFn = async (
  library: Library,
  track: Track,
) => {
  const url = library.api.getAuthenticatedUrl(
    `/library/metadata/${track.id}/nearest`,
    {
      excludeGrandparentID: track.grandparentId,
      limit: 100,
      maxDistance: 0.25,
      sort: 'distance',
    },
  );
  const response = await ky(url).json() as Record<string, any>;
  return parseTrackContainer(response).tracks;
};

export const trackHistoryQueryFn = async (
  config: AppConfig,
  library: Library,
  id: number,
) => {
  const url = library.api.getAuthenticatedUrl(
    '/status/sessions/history/all',
    {
      sort: plexSort(TrackSortKeys.VIEWED_AT, SortOrders.DESC).stringify(),
      librarySectionID: config.sectionId!,
      metadataItemID: id,
      accountID: 1,
    },
  );
  const response = await ky(url).json() as Record<string, any>;
  if (response.MediaContainer.size === 0) {
    return [];
  }
  return response.MediaContainer.Metadata as Playcount[];
};
