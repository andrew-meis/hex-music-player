import { useQuery } from '@tanstack/react-query';
import { Account } from 'hex-plex';
import useQueue from 'hooks/useQueue';
import { useAccount, useLibrary, useQueueId } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';
import { Result } from 'types/types';
import { searchQueryFn, searchTracksQueryFn } from './plex-query-fns';

export const useCurrentQueue = () => {
  const library = useLibrary();
  const queueId = useQueueId();
  const { getQueue } = useQueue();
  return useQuery(
    [QueryKeys.PLAYQUEUE, queueId],
    () => getQueue(),
    {
      enabled: queueId !== 0 && !!library,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );
};

export const useNowPlaying = () => {
  const library = useLibrary();
  const queueId = useQueueId();
  const { getQueue } = useQueue();
  return useQuery(
    [QueryKeys.PLAYQUEUE, queueId],
    () => getQueue(),
    {
      enabled: queueId !== 0 && !!library,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      select: (data) => {
        const currentIndex = data.items.findIndex((item) => item.id === data.selectedItemId);
        return data.items[currentIndex];
      },
    },
  );
};

export const useSearch = ({
  query, onSuccess,
}: {
  query: string, onSuccess: (data: Result[]) => void,
}) => {
  const library = useLibrary();
  return useQuery(
    [QueryKeys.SEARCH, query],
    () => searchQueryFn(library, query),
    {
      enabled: query.length > 1,
      keepPreviousData: true,
      onSuccess,
      refetchOnWindowFocus: false,
    },
  );
};

export const useSearchTracks = ({
  artist, sectionId, title,
}: {
  artist: string, sectionId: number, title: string,
}) => {
  const library = useLibrary();
  const account = library.api.parent as Account;
  return useQuery(
    [QueryKeys.SEARCH_TRACKS, artist, title],
    () => searchTracksQueryFn({
      account,
      artist,
      library,
      title,
      sectionId,
    }),
    {
      refetchOnWindowFocus: false,
    },
  );
};

export const useUser = () => {
  const account = useAccount();
  return useQuery(
    [QueryKeys.USER],
    () => account.info(),
    {
      enabled: !!account,
      refetchOnWindowFocus: false,
    },
  );
};
