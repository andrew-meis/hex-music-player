import { useQuery } from '@tanstack/react-query';
import { lastfmSimilarQueryFn, lastfmTrackQueryFn } from './last-fm-query-fns';

export const useLastfmSimilar = (
  {
    apikey, artist, title,
  } : {
    apikey?: string, artist: string, title: string,
  },
) => useQuery(
  ['lastfm-similar', artist, title],
  () => lastfmSimilarQueryFn(artist, title, apikey),
  {
    enabled: !!apikey,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60,
  },
);

export const useLastfmTrack = (
  {
    apikey, artist, title,
  } : {
    apikey?: string, artist?: string, title?: string,
  },
) => useQuery(
  ['lastfm-track', artist, title],
  () => lastfmTrackQueryFn(apikey, artist, title),
  {
    enabled: !!apikey && !!artist && !!title,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60,
  },
);
