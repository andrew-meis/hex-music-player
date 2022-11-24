import { useQuery } from '@tanstack/react-query';
import { Album, Artist, MediaType, Playlist, Track } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { forEach, groupBy, uniqBy } from 'lodash';
import { useRef } from 'react';
import { initializeApp } from '../core/Authentication';
import { usePlayerContext } from '../core/Player';
import { AppSettings, AppState, Config, DiscHeader } from '../types/interfaces';
import { Result } from '../types/types';
import {
  useGetAlbum,
  useGetAlbumQuery,
  useGetArtist,
  useGetArtistAppearances,
  useGetArtistTracks,
  useGetTop,
} from './plexHooks';
import useQueue from './useQueue';

const defaultSettings: AppSettings = {
  albumText: true,
  colorMode: 'dark',
  compactNav: false,
  compactQueue: false,
  dockedQueue: true,
  repeat: 'repeat-none',
};

/**
 * APP STATE QUERIES
 */
export const useConfig = () => useQuery(
  ['config'],
  () => window.electron.readConfig('config') as Config,
  {
    initialData: window.electron.readConfig('config') as Config,
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  },
);

export const useApp = (
  onSuccess?: () => void | undefined,
  onError?: () => void | undefined,
) => {
  const { data: config } = useConfig();
  return useQuery<AppState>(
    ['app', config.serverName],
    () => initializeApp(config),
    {
      enabled: !!config,
      onSuccess,
      onError,
      refetchOnMount: false,
      refetchOnReconnect: 'always',
      refetchOnWindowFocus: false,
      retry: false,
    },
  );
};

export const useAccount = () => {
  const { data: app, isSuccess } = useApp();
  if (isSuccess) {
    return app.account;
  }
  throw new Error('no account');
};

export const useLibrary = () => {
  const { data: app, isSuccess } = useApp();
  if (isSuccess) {
    return app.library;
  }
  throw new Error('no library');
};

export const useQueueId = () => useQuery(
  ['config'],
  () => window.electron.readConfig('config') as Config,
  {
    initialData: window.electron.readConfig('config') as Config,
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    select: (data) => (data.queueId === undefined ? 0 : data.queueId),
  },
);

export const useServer = () => {
  const { data: app, isSuccess } = useApp();
  if (isSuccess) {
    return app.server;
  }
  throw new Error('no server');
};

export const useSettings = () => useQuery(
  ['settings'],
  () => {
    const savedSettings = window.electron.readConfig('settings') as AppSettings;
    return { ...defaultSettings, ...savedSettings };
  },
  {
    initialData: () => {
      if (Object.keys(window.electron.readConfig('settings')).length === 0) {
        return defaultSettings;
      }
      const savedSettings = window.electron.readConfig('settings') as AppSettings;
      return { ...defaultSettings, ...savedSettings };
    },
    refetchOnMount: false,
    refetchOnReconnect: 'always',
    refetchOnWindowFocus: false,
  },
);

/**
 * PLAYER STATE
 */
export const usePlayerState = () => {
  const prevPlayState = useRef<boolean>(false);
  const player = usePlayerContext();
  return useQuery(
    ['player-state'],
    () => ({
      duration: player.currentLength(),
      isPlaying: player.isPlaying() || prevPlayState.current,
      position: player.getPosition(),
    }),
    {
      initialData: {
        duration: 0,
        isPlaying: false,
        position: 0,
      },
      onSuccess: () => {
        prevPlayState.current = player.isPlaying();
      },
      refetchInterval: () => {
        if (player.isPlaying()) {
          return 1000;
        }
        return false;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
};

export const useIsPlaying = () => {
  const player = usePlayerContext();
  return useQuery(
    ['player-state'],
    () => ({
      duration: player.currentLength(),
      isPlaying: player.isPlaying(),
      position: player.getPosition(),
    }),
    {
      initialData: {
        duration: 0,
        isPlaying: false,
        position: 0,
      },
      select: (data) => data.isPlaying,
    },
  );
};

/**
 * PLEX API QUERIES
 */
export const useAlbum = (albumId: Album['id']) => {
  const getAlbum = useGetAlbum();
  return useQuery(
    ['album', albumId],
    () => getAlbum(albumId),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useAlbumQuery = (query: Record<string, string>) => {
  const getAlbumQuery = useGetAlbumQuery();
  return useQuery(
    ['albums', query],
    () => getAlbumQuery(query),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useAlbumTracks = (albumId: Album['id']) => {
  const library = useLibrary();
  return useQuery(
    ['album-tracks', albumId],
    () => library.albumTracks(albumId).then((r) => {
      const { tracks } = r;
      return tracks;
    }),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useArtist = (artistId: Artist['id']) => {
  const getArtist = useGetArtist();
  return useQuery(
    ['artist', artistId],
    () => getArtist(artistId),
    {
      enabled: artistId !== -1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useArtistAppearances = (
  artistId: Artist['id'],
  artistTitle: Artist['title'],
  artistGuid: Artist['guid'],
) => {
  const getArtistAppearances = useGetArtistAppearances();
  return useQuery(
    ['artist-appearances', artistId],
    () => getArtistAppearances(artistId, artistTitle, artistGuid),
    {
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useArtistTracks = ({
  artistId, artistTitle, artistGuid, slice, limit,
}: {
  artistId: Artist['id'],
  artistTitle: Artist['title'],
  artistGuid: Artist['guid'],
  slice?: number,
  limit?: number,
}) => {
  const getArtistTracks = useGetArtistTracks();
  return useQuery(
    ['artist-tracks', artistId, slice],
    () => getArtistTracks({
      guid: artistGuid,
      id: artistId,
      title: artistTitle,
      limit,
      slice,
    }),
    {
      enabled: artistId !== -1,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
    },
  );
};

export const useCurrentQueue = () => {
  const library = useLibrary();
  const { data: queueId } = useQueueId();
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
  const { data: queueId } = useQueueId();
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

export const usePlaylists = () => {
  const library = useLibrary();
  return useQuery(
    ['playlists'],
    () => library.playlists({ playlistType: 'audio' }),
    {
      enabled: !!library,
      refetchOnMount: false,
      select: (data) => data.playlists,
    },
  );
};

export const usePlaylist = (playlistId: Playlist['id']) => {
  const library = useLibrary();
  return useQuery(
    ['playlists'],
    () => library.playlists({ playlistType: 'audio' }),
    {
      enabled: !!library,
      refetchOnMount: true,
      select: (data) => data.playlists.find((playlist) => playlist.id === playlistId),
    },
  );
};

export const usePlaylistItems = (playlistId: Playlist['id']) => {
  const library = useLibrary();
  return useQuery(
    ['playlist', playlistId],
    () => library.playlistTracks(playlistId),
    {
      staleTime: 5 * 60 * 1000,
      refetchOnWindowFocus: false,
      select: (data) => data.items,
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

export const useTopAlbums = (
  { limit, start, end, seconds }: { limit: number, start?: number, end?: number, seconds?: number },
) => {
  const library = useLibrary();
  const type = 9;
  const topAlbums = useGetTop({ type, limit, seconds, start, end });
  return useQuery(
    ['top', { type, limit, seconds, start, end }],
    () => topAlbums().then((response) => {
      if (!response) {
        return undefined;
      }
      const { albums } = parseContainerType(MediaType.ALBUM, response.data);
      return uniqBy(albums, 'guid');
    }),
    {
      enabled: !!library,
      keepPreviousData: true,
      refetchInterval: 1000 * 60 * 30,
      refetchOnWindowFocus: false,
    },
  );
};

export const useTopTracks = (
  { limit, start, end, seconds }: { limit: number, start?: number, end?: number, seconds?: number },
) => {
  const library = useLibrary();
  const type = 10;
  const topTracks = useGetTop({ type, limit, seconds, start, end });
  return useQuery(
    ['top', { type, limit, seconds, start, end }],
    () => topTracks().then((response) => {
      if (!response) {
        return undefined;
      }
      const { tracks } = parseContainerType(MediaType.TRACK, response.data);
      return uniqBy(tracks, 'guid');
    }),
    {
      enabled: !!library,
      keepPreviousData: true,
      refetchInterval: 1000 * 60 * 30,
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
