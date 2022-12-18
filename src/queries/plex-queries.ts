import { useQuery } from '@tanstack/react-query';
import useQueue from 'hooks/useQueue';
import { useAccount, useLibrary, useQueueId } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';
import { Result } from 'types/types';

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
    async () => {
      const response = await library.searchAll(query, 10);
      return response.hubs
        .filter((hub) => hub.type === 'artist' || hub.type === 'album' || hub.type === 'track')
        .map((option) => option.items)
        .flat() as Result[];
    },
    {
      enabled: query.length > 1,
      keepPreviousData: true,
      onSuccess,
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
