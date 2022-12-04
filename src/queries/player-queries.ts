import { useQuery } from '@tanstack/react-query';
import { useRef } from 'react';
import { usePlayerContext } from 'root/Player';

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
