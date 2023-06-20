import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { usePlayerContext } from 'root/Player';
import { QueryKeys } from 'types/enums';

export const usePlayerState = () => {
  const prevPlayState = useRef<boolean>(false);
  const player = usePlayerContext();
  return useQuery(
    [QueryKeys.PLAYER_STATE],
    () => ({
      duration: player.currentLength(),
      isPlaying: player.isPlaying() || prevPlayState.current,
    }),
    {
      initialData: {
        duration: 0,
        isPlaying: false,
      },
      onSuccess: () => {
        prevPlayState.current = player.isPlaying();
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
    [QueryKeys.PLAYER_STATE],
    () => ({
      duration: player.currentLength(),
      isPlaying: player.isPlaying(),
    }),
    {
      initialData: {
        duration: 0,
        isPlaying: false,
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: (data) => data.isPlaying,
    },
  );
};

export const usePlayPosition = () => {
  const player = usePlayerContext();
  return useQuery(
    [QueryKeys.PLAY_POSITION],
    () => ({
      position: player.getPosition(),
    }),
    {
      initialData: {
        position: 0,
      },
      refetchInterval: () => {
        if (player.isPlaying()) {
          return 300;
        }
        return false;
      },
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
};
