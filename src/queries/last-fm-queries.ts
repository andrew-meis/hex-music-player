import { useQuery } from '@tanstack/react-query';
import { QueryKeys } from 'types/enums';
import { lastfmSearchQueryFn, lastfmSimilarQueryFn, lastfmTrackQueryFn } from './last-fm-query-fns';

export const useLastfmSearch = (
  {
    apikey, artist, title,
  } : {
    apikey?: string, artist?: string, title?: string,
  },
) => useQuery(
  [QueryKeys.LASTFM_SEARCH, artist, title],
  () => lastfmSearchQueryFn(artist, title, apikey),
  {
    enabled: !!apikey && !!artist && !!title,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60,
  },
);

export const useLastfmSimilar = (
  {
    apikey, artist, title,
  } : {
    apikey?: string, artist?: string, title?: string,
  },
) => useQuery(
  [QueryKeys.LASTFM_SIMILAR, artist, title],
  () => lastfmSimilarQueryFn(artist, title, apikey),
  {
    enabled: !!apikey && !!artist && !!title,
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
  [QueryKeys.LASTFM_TRACK, artist, title],
  () => lastfmTrackQueryFn(artist, title, apikey),
  {
    enabled: !!apikey && !!artist && !!title,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 60,
  },
);
