import ky from 'ky';
import { countBy } from 'lodash';
import moment from 'moment';
import { Library, Track, parseTrackContainer } from 'api/index';
import { plexSort } from 'classes';
import { SortOrders, TrackSortKeys } from 'types/enums';
import { AppConfig } from 'types/interfaces';

export interface LyricsObject {
  albumGuid: string;
  artistGuid: string;
  trackGuid: string;
  albumTitle: string;
  artistTitle: string;
  trackTitle: string;
  instrumental: boolean;
  plainLyrics: string | null;
  syncedLyrics: string | null;
}

export interface LyricsResponse {
  albumName: string;
  artistName: string;
  duration: number;
  id: number;
  instrumental: boolean;
  isrc: string;
  lang: string;
  name: string;
  plainLyrics: string | null;
  releaseData: string;
  spotifyId: string;
  syncedLyrics: string | null;
}

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

const createLyricsUrl = (
  artist: string,
  album: string,
  track: string,
  duration: string,
) => {
  const url = 'https://lrclib.net/api/get';
  const params = new URLSearchParams();
  params.append('artist_name', artist);
  params.append('album_name', album);
  params.append('track_name', track);
  params.append('duration', duration);
  return `${url}?${params.toString()}`;
};

export const lyricsQueryFn = async (
  track: Track,
) => {
  const savedLyrics = window.electron.readLyrics(track.grandparentGuid, track.guid);
  const shouldRefetch = savedLyrics
    && !savedLyrics.instrumental
    && !savedLyrics.plainLyrics
    && !savedLyrics.syncedLyrics;
  if (savedLyrics && !shouldRefetch) {
    return savedLyrics;
  }
  try {
    const url = createLyricsUrl(
      track.grandparentTitle?.toLowerCase() || ' ',
      track.parentTitle?.toLowerCase() || ' ',
      track.title?.toLowerCase() || ' ',
      (Math.floor((track.duration || 0) / 1000)).toString(),
    );
    const response = await ky(url).json<LyricsResponse>();
    const lyrics: LyricsObject = {
      albumGuid: track.parentGuid,
      artistGuid: track.grandparentGuid,
      trackGuid: track.guid,
      albumTitle: track.parentTitle,
      artistTitle: track.grandparentTitle === 'Various Artists'
        ? track.originalTitle
        : track.grandparentTitle,
      trackTitle: track.title,
      instrumental: response.instrumental,
      plainLyrics: response.plainLyrics,
      syncedLyrics: response.syncedLyrics,
    };
    window.electron.writeLyrics(lyrics);
    return lyrics;
  } catch {
    try {
      const url = createLyricsUrl(
        track.originalTitle?.toLowerCase() || ' ',
        track.parentTitle?.toLowerCase() || ' ',
        track.title?.toLowerCase() || ' ',
        (Math.floor((track.duration || 0) / 1000)).toString(),
      );
      const response = await ky(url).json<LyricsResponse>();
      const lyrics: LyricsObject = {
        albumGuid: track.parentGuid,
        artistGuid: track.grandparentGuid,
        trackGuid: track.guid,
        albumTitle: track.parentTitle,
        artistTitle: track.grandparentTitle === 'Various Artists'
          ? track.originalTitle
          : track.grandparentTitle,
        trackTitle: track.title,
        instrumental: response.instrumental,
        plainLyrics: response.plainLyrics,
        syncedLyrics: response.syncedLyrics,
      };
      window.electron.writeLyrics(lyrics);
      return lyrics;
    } catch {
      const lyrics: LyricsObject = {
        albumGuid: track.parentGuid,
        artistGuid: track.grandparentGuid,
        trackGuid: track.guid,
        albumTitle: track.parentTitle,
        artistTitle: track.grandparentTitle === 'Various Artists'
          ? track.originalTitle
          : track.grandparentTitle,
        trackTitle: track.title,
        instrumental: false,
        plainLyrics: null,
        syncedLyrics: null,
      };
      window.electron.writeLyrics(lyrics);
      return lyrics;
    }
  }
};

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
    },
  );
  const response = await ky(url).json() as Record<string, any>;
  if (response.MediaContainer.size === 0) {
    return [];
  }
  return response.MediaContainer.Metadata as Playcount[];
};
