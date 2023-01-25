import axios from 'axios';
import { LastFmSearchResult, LastFmTrack } from 'types/lastfm-interfaces';

const LASTFM_ROOT = 'https://ws.audioscrobbler.com/2.0/';

const getInfo = async (apikey: string, artist: string, title: string) => {
  const params = new URLSearchParams();
  params.append('method', 'track.getInfo');
  params.append('api_key', apikey);
  params.append('artist', artist);
  params.append('track', title);
  params.append('format', 'json');
  const url = `${LASTFM_ROOT}?${params.toString()}`;
  const response = await axios.get(url);
  return response.data.track as LastFmTrack;
};

const getSimilar = async (apikey: string, artist: string, title: string) => {
  const params = new URLSearchParams();
  params.append('method', 'track.getSimilar');
  params.append('api_key', apikey);
  params.append('artist', artist);
  params.append('track', title);
  params.append('autocorrect', '1');
  params.append('format', 'json');
  const url = `${LASTFM_ROOT}?${params.toString()}`;
  const response = await axios.get(url);
  return response.data.similartracks.track as LastFmTrack[];
};

const search = async (apikey: string, artist: string, title: string) => {
  const params = new URLSearchParams();
  params.append('method', 'track.search');
  params.append('api_key', apikey);
  params.append('artist', artist);
  params.append('track', title);
  params.append('limit', '1');
  params.append('format', 'json');
  const url = `${LASTFM_ROOT}?${params.toString()}`;
  const response = await axios.get(url);
  return response.data.results.trackmatches.track[0] as LastFmSearchResult;
};

export const lastfmSearchQueryFn = async (artist?: string, title?: string, apikey?: string) => {
  const result = await search(apikey!, artist!, title!);
  return result;
};

export const lastfmSimilarQueryFn = async (artist?: string, title?: string, apikey?: string) => {
  const similar = await getSimilar(apikey!, artist!, title!);
  return similar;
};

export const lastfmTrackQueryFn = async (artist?: string, title?: string, apikey?: string) => {
  const track = await getInfo(apikey!, artist!, title!);
  return track;
};
