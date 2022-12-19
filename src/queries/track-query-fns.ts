import axios from 'axios';
import { Library, Track } from 'hex-plex';
import { parseTrackContainer } from 'hex-plex/dist/types/track';
import { countBy } from 'lodash';
import moment from 'moment';
import { IConfig } from 'types/interfaces';

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
  const response = await axios.get(url);
  return parseTrackContainer(response.data).tracks;
};

export const trackHistoryQueryFn = async (
  config: IConfig,
  library: Library,
  id: number,
  days: number,
) => {
  const time = moment();
  const url = library.api.getAuthenticatedUrl(
    '/status/sessions/history/all',
    {
      sort: 'viewedAt:desc',
      librarySectionID: config.sectionId!,
      metadataItemID: id,
      'viewedAt<': time.unix(),
      'viewedAt>': time.subtract(days, 'day').unix(),
      accountID: 1,
    },
  );
  const response = await axios.get(url);
  if (response.data.MediaContainer.size === 0) {
    return [];
  }
  const keys = response.data.MediaContainer.Metadata.map((record: Track) => record.ratingKey);
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
