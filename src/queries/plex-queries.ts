import { useQuery } from '@tanstack/react-query';
import useQueue from 'hooks/useQueue';
import { useAccount, useLibrary, useQueueId } from 'queries/app-queries';
import { Result } from 'types/types';

export const useCurrentQueue = () => {
  const library = useLibrary();
  const queueId = useQueueId();
  const { getQueue } = useQueue();
  return useQuery(
    ['play-queue', queueId],
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
    ['play-queue', queueId],
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

export const useSearch = ({ query }: {query: string}) => {
  const library = useLibrary();
  return useQuery<Result[]>(
    ['search', query],
    async () => {
      const response = await library.searchAll(query, 10);
      return response.hubs
        .filter((hub) => hub.type === 'artist' || hub.type === 'album' || hub.type === 'track')
        .map((option) => option.items)
        .flat();
    },
    {
      enabled: !!library && query.length > 1,
      keepPreviousData: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useUser = () => {
  const account = useAccount();
  return useQuery(
    ['user'],
    () => account.info(),
    {
      enabled: !!account,
      refetchOnWindowFocus: false,
    },
  );
};
