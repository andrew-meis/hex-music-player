import { useQueryClient } from '@tanstack/react-query';
// eslint-disable-next-line import/no-unresolved
import { Updater } from '@tanstack/react-query/build/types/packages/query-core/src/utils';
import React, {
  ReactNode, useCallback, useContext, useEffect, useMemo, useRef,
} from 'react';
import { Gapless5, LogLevel } from '@regosen/gapless-5';
import { PlayQueue, PlayQueueItem } from 'hex-plex';
import {
  useCurrentQueue, useLibrary, useNowPlaying, useQueueId,
} from '../hooks/queryHooks';
import useQueue from '../hooks/useQueue';
import { PlayerState } from '../types/interfaces';

const playerOptions = {
  loadLimit: 2,
  useHTML5Audio: false,
  logLevel: LogLevel.Debug,
};

export const PlayerContext = React.createContext<Gapless5 | undefined>(undefined);

export const usePlayerContext = () => {
  const player = useContext(PlayerContext);
  if (!player) {
    throw new Error('No player');
  }

  return player;
};

const Player = ({ children }: {children: ReactNode}) => {
  const initialized = useRef<boolean | null>(null);
  const loadQueue = useRef<PlayQueueItem[]>([]);
  const library = useLibrary();
  const player = useMemo((): Gapless5 => new Gapless5(playerOptions), []);
  const queryClient = useQueryClient();
  const timelineRef = useRef(0);
  const { data: nowPlaying } = useNowPlaying();
  const { data: playQueue } = useCurrentQueue();
  const { data: queueId } = useQueueId();
  const { setQueueId, updateTimeline } = useQueue();

  const startTimer = useCallback((queueItem: PlayQueueItem) => {
    window.clearInterval(timelineRef.current);

    timelineRef.current = window.setInterval(() => {
      updateTimeline(queueItem.id, 'playing', player.currentPosition(), queueItem.track);
    }, 10000);
  }, [updateTimeline, player]);

  useEffect(() => {
    if (!initialized.current && playQueue) {
      player.initTracks(playQueue, false);
      initialized.current = true;
    }
  }, [playQueue, player]);

  useEffect(() => {
    if (nowPlaying) {
      document.title = `${nowPlaying.track.grandparentTitle} – ${nowPlaying.track.title}`;
    }
    if (!nowPlaying) {
      document.title = 'Hex Music Player';
    }
  }, [nowPlaying]);

  useEffect(() => {
    if (player.isPlaying() && nowPlaying) {
      startTimer(nowPlaying);
      updateTimeline(nowPlaying.id, 'playing', player.currentPosition(), nowPlaying.track);
    }
  }, [nowPlaying, player, startTimer, updateTimeline]);

  player.clearTimer = () => {
    window.clearInterval(timelineRef.current);
  };

  player.startTimer = (queueItem: PlayQueueItem) => {
    startTimer(queueItem);
  };

  player.initTracks = (queue: PlayQueue, forcePlay: boolean = true) => {
    const currentIndex = queue.items.findIndex((item) => item.id === queue.selectedItemId);
    const current = queue.items[currentIndex];
    const next = queue.items[currentIndex + 1];
    player.removeAllTracks();
    if (next) {
      loadQueue.current.push(next);
    }
    if (current) {
      player.addTrack(library.trackSrc(current.track));
      if (forcePlay) {
        player.play();
        updateTimeline(current.id, 'playing', 0, current.track);
        startTimer(current);
      }
    }
  };

  player.resetApp = async () => {
    player.stop();
    await setQueueId(0);
    player.removeAllTracks();
    queryClient.removeQueries(['play-queue']);
    queryClient.setQueryData(
      ['player-state'],
      () => ({ duration: 0, isPlaying: false, position: 0 }),
    );
  };

  player.updateTracks = (queue: PlayQueue, action: 'next' | 'prev' | 'update') => {
    const currentIndex = queue.items.findIndex((item) => item.id === queue.selectedItemId);
    const current = queue.items[currentIndex];
    const next = queue.items[currentIndex + 1];
    if (action === 'next') {
      if (player.playlist.trackNumber === 1) {
        player.removeTrack(0);
        if (next) {
          player.insertTrack(1, library.trackSrc(next.track));
        }
      }
      return;
    }
    if (action === 'prev') {
      if (player.playlist.trackNumber === 0 && player.getTracks().length === 2) {
        if (current) {
          player.insertTrack(0, library.trackSrc(current.track));
          player.gotoTrack(0, true);
          player.removeTrack(2);
        }
      }
      return;
    }
    if (action === 'update') {
      if (player.playlist.trackNumber === 0 && player.getTracks().length === 1) {
        if (next) {
          player.replaceTrack(1, library.trackSrc(next.track));
        }
      }
      if (player.playlist.trackNumber === 0 && player.getTracks().length === 2) {
        if (next) {
          if (player.playlist.sources[1].audioPath === library.trackSrc(next.track)) {
            return;
          }
          player.replaceTrack(1, library.trackSrc(next.track));
        }
      }
    }
  };

  player.onfinishedall = async () => {
    window.clearInterval(timelineRef.current);
    player.stop();
    if (nowPlaying) {
      await updateTimeline(nowPlaying.id, 'stopped', nowPlaying.track.duration, nowPlaying.track);
      await setQueueId(0);
      player.removeAllTracks();
      queryClient.removeQueries(['play-queue']);
      queryClient.setQueryData(
        ['player-state'],
        () => ({ duration: 0, isPlaying: false, position: 0 }),
      );
    }
  };

  player.onfinishedtrack = async () => {
    if (playQueue) {
      const currentIndex = playQueue.items
        .findIndex((item) => item.id === playQueue.selectedItemId);
      const next = playQueue.items[currentIndex + 1];
      if (!next) {
        return;
      }
      if (nowPlaying) {
        await updateTimeline(nowPlaying.id, 'stopped', nowPlaying.track.duration, nowPlaying.track);
        await updateTimeline(next.id, 'playing', 0, next.track);
        await queryClient.refetchQueries(['play-queue', queueId]);
        const newQueue = queryClient.getQueryData(['play-queue', queueId]);
        player.updateTracks(newQueue, 'next');
        queryClient.setQueryData(
          ['player-state'],
          (
            current: Updater<PlayerState, PlayerState> | undefined,
          ) => ({ ...current, isPlaying: true, position: 0 }),
        );
        await startTimer(next);
      }
    }
  };

  player.onload = async () => {
    await queryClient.refetchQueries(['player-state']);
    const newTrack = loadQueue.current.shift();
    if (!newTrack) {
      return;
    }
    if (player.playlist.trackNumber === 0) {
      player.addTrack(library.trackSrc(newTrack.track));
    }
    if (player.playlist.trackNumber === 1) {
      player.removeTrack(0);
      player.addTrack(library.trackSrc(newTrack.track));
    }
  };

  player.onplay = () => {
    window.electron.updatePlaying('playing', true);
  };

  player.onpause = () => {
    window.electron.updatePlaying('playing', false);
  };

  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
};

export default Player;
