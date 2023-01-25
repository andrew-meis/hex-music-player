import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { Account, MediaType } from 'hex-plex';
import { parseTrackContainer } from 'hex-plex/dist/types/track';
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

export const useSearchTracks = ({
  artist, sectionId, title,
}: {
  artist: string, sectionId: number, title: string,
}) => {
  const library = useLibrary();
  const account = library.api.parent as Account;
  return useQuery(
    [QueryKeys.SEARCH_TRACKS, artist, title],
    async () => {
      const params = new URLSearchParams();
      params.append('push', '1');
      params.append('artist.title', artist);
      if (artist.includes('’')) {
        params.append('or', '1');
        params.append('artist.title', artist.replace(/[’]/g, "'"));
        params.append('or', '1');
        params.append('artist.title', artist.replace(/[’]/g, ''));
      }
      if (artist.includes("'")) {
        params.append('or', '1');
        params.append('artist.title', artist.replace(/[']/g, '’'));
        params.append('or', '1');
        params.append('artist.title', artist.replace(/[']/g, ''));
      }
      params.append('pop', '1');
      params.append('push', '1');
      params.append('track.title', title);
      if (title.includes('’')) {
        params.append('or', '1');
        params.append('track.title', title.replace(/[’]/g, "'"));
        params.append('or', '1');
        params.append('track.title', title.replace(/[’]/g, ''));
      }
      if (title.includes("'")) {
        params.append('or', '1');
        params.append('track.title', title.replace(/[']/g, '’'));
        params.append('or', '1');
        params.append('track.title', title.replace(/[']/g, ''));
      }
      params.append('pop', '1');
      params.append('type', MediaType.TRACK.toString());
      params.append('limit', '10');
      // eslint-disable-next-line prefer-template
      const url = library.api.uri
        + `/library/sections/${sectionId}`
        + `/search?${params.toString()}`
        + `&X-Plex-Token=${account.authToken}`;
      const response = await axios.get(url, { headers: library.api.headers() });
      return parseTrackContainer(response.data).tracks;
    },
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
