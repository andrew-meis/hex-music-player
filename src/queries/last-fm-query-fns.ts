import axios from 'axios';
import { LastFmCorrection, LastFmTrack } from 'types/lastfm-interfaces';

const LASTFM_ROOT = 'https://ws.audioscrobbler.com/2.0/';

const getCorrection = async (apikey: string, artist: string, title: string) => {
  const params = new URLSearchParams();
  params.append('method', 'track.getCorrection');
  params.append('api_key', apikey);
  params.append('artist', artist);
  params.append('track', title);
  params.append('format', 'json');
  const url = `${LASTFM_ROOT}?${params.toString()}`;
  const response = await axios.get(url);
  return response.data.corrections.correction.track as LastFmCorrection;
};

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

export const lastfmSimilarQueryFn = async (artist: string, title: string, apikey?: string) => {
  const similar = await getSimilar(apikey!, artist, title);
  return similar;
};

export const lastfmTrackQueryFn = async (apikey?: string, artist?: string, title?: string) => {
  const correction = await getCorrection(apikey!, artist!, title!);
  const track = await getInfo(apikey!, correction.artist.name, correction.name);
  return { track, correction };
};
