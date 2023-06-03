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

export const useIsPlaying = () => {
  const player = usePlayerContext();
  return useQuery(
    [QueryKeys.PLAYER_STATE],
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
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      select: (data) => data.isPlaying,
    },
  );
};
