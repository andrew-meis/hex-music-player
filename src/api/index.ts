import * as filter from './filter';

export { filter };
export { parseContainerType } from './library';
export { parseAlbumContainer } from './types/album';
export { parseArtistContainer } from './types/artist';
export { parseHubContainer } from './types/hub';
export { parsePlaylistContainer } from './types/playlist';
export { parsePlayQueue } from './types/play-queue';
export { parseTrackContainer } from './types/track';

export { default as Account } from './account';
export { default as Client } from './client';
export { default as ServerConnection } from './server-connection';
export { default as normalize, normalizeSync } from './normalize';

export type { Album, AlbumContainer } from './types/album';
export type { Artist, ArtistContainer } from './types/artist';
export type { Collection } from './types/collection';
export type { Country } from './types/country';
export type { Decade } from './types/decade';
export type { Device, Connection } from './types/device';
export type { Format } from './types/format';
export type { Genre } from './types/genre';
export type { Hub } from './types/hub';
export type { Media } from './types/media';
export type { MediaContainer } from './types/media-container';
export type { Mood } from './types/mood';
export type { Part } from './types/part';
export type { Pin } from './types/pin';
export type { ResourceContainer } from './types/resources';
export type { Stream } from './types/stream';
export type { PlaylistItem, Playlist, PlaylistContainer } from './types/playlist';
export type { PlayQueueItem, PlayQueue } from './types/play-queue';
export type { Studio } from './types/studio';
export type { Style } from './types/style';
export type { Subformat } from './types/subformat';
export type { Tag } from './types/tag';
export type { Track, TrackContainer } from './types/track';
export type { User, UserSubscription, Subscription, Service, Profile } from './types/user';
export type { Year } from './types/year';

export { default as Library, MediaType } from './library';

const sort = (asc: string, desc = `${asc}:desc`) => [asc, desc];

// sort methods
export const SORT_ARTISTS_BY_TITLE = sort('titleSort');
export const SORT_ARTISTS_BY_DATE_ADDED = sort('addedAt');
export const SORT_ARTISTS_BY_DATE_PLAYED = sort('lastViewedAt');
export const SORT_ARTISTS_BY_PLAYS = sort('viewCount');

export const SORT_ALBUMS_BY_TITLE = sort('titleSort');
export const SORT_ALBUMS_BY_ALBUM_ARTIST = sort(
  'artist.titleSort,album.year',
  'artist.titleSort:desc,album.year',
);
export const SORT_ALBUMS_BY_YEAR = sort('year');
export const SORT_ALBUMS_BY_RELEASE_DATE = sort('originallyAvailableAt');
export const SORT_ALBUMS_BY_RATING = sort('userRating');
export const SORT_ALBUMS_BY_DATE_ADDED = sort('addedAt');
export const SORT_ALBUMS_BY_DATE_PLAYED = sort('lastViewedAt');
export const SORT_ALBUMS_BY_VIEWS = sort('viewCount');

export const SORT_PLAYLISTS_BY_NAME = sort('titleSort');
export const SORT_PLAYLISTS_BY_PLAYS = sort('viewCount');
export const SORT_PLAYLISTS_BY_LAST_PLAYED = sort('lastViewedAt');
export const SORT_PLAYLISTS_BY_DURATION = sort('duration');
export const SORT_PLAYLISTS_BY_DATE_ADDED = sort('addedAt');
export const SORT_PLAYLISTS_BY_ITEM_COUNT = sort('mediaCount');

export const SORT_TRACKS_BY_TITLE = sort('titleSort');
export const SORT_TRACKS_BY_ALBUM_ARTIST = sort(
  'artist.titleSort,album.titleSort,track.index',
);
export const SORT_TRACKS_BY_ARTIST = sort(
  'track.originalTitle,album.titleSort,track.index',
);
export const SORT_TRACKS_BY_ALBUM = sort('album.titleSort,track.index');
export const SORT_TRACKS_BY_YEAR = sort('year');
export const SORT_TRACKS_BY_RATING = sort('userRating');
export const SORT_TRACKS_BY_DURATION = sort('duration');
export const SORT_TRACKS_BY_PLAYS = sort('viewCount');
export const SORT_TRACKS_BY_DATE_ADDED = sort('addedAt');
export const SORT_TRACKS_BY_BITRATE = sort('mediaBitrate');
export const SORT_TRACKS_BY_POPULARITY = sort('ratingCount');

// playlist types
export const PLAYLIST_TYPE_MUSIC = 'audio';
export const PLAYLIST_TYPE_PHOTO = 'photo';
export const PLAYLIST_TYPE_VIDEO = 'video';
