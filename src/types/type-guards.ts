/* eslint-disable no-underscore-dangle */
import {
  Album, Artist, PlaylistItem, PlayQueueItem, Track,
} from 'hex-plex';
import { DiscHeader } from './interfaces';

export const isAlbum = (x: any): x is Album => x._type === 'album';
export const isArtist = (x: any): x is Artist => x._type === 'artist';
export const isDiscHeader = (x: any): x is DiscHeader => x._type === 'discHeader';
export const isPlayListItem = (x: any): x is PlaylistItem => x._type === 'playlistItem';
export const isPlayQueueItem = (x: any): x is PlayQueueItem => x._type === 'playQueueItem';
export const isTrack = (x: any): x is Track => x._type === 'track';
