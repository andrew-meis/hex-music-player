import { Gapless5, LogLevel } from '@regosen/gapless-5';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import React, {
  ReactNode, useCallback, useContext, useEffect, useRef,
} from 'react';
import useQueue from 'hooks/useQueue';
import { useLibrary, useQueueId, useSettings } from 'queries/app-queries';
import { useCurrentQueue, useNowPlaying } from 'queries/plex-queries';
import { QueryKeys } from 'types/enums';
import type { Updater } from '@tanstack/react-query';
import type { PlayQueue, PlayQueueItem, Track } from 'hex-plex';
import type { PlayerState } from 'types/interfaces';

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
  const queryClient = useQueryClient();
  const queueId = useQueueId();
  const timelineRef = useRef(0);
  const { data: nowPlaying } = useNowPlaying();
  const { data: playQueue } = useCurrentQueue();
  const { data: settings } = useSettings();
  const { setQueueId, updateTimeline } = useQueue();
  const volume = useQuery(
    ['volume'],
    () => 40,
    {
      initialData: 40,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const { current: player } = useRef(new Gapless5({
    ...playerOptions,
    loop: settings.repeat !== 'repeat-none',
    singleMode: settings.repeat === 'repeat-one',
  }));

  player.applyTrackGain = (track: Track) => {
    if (track.media[0].parts[0].streams[0].gain) {
      const decibelLevel = 20 * Math.log10(volume.data / 100);
      const adjustedDecibels = decibelLevel + (+track.media[0].parts[0].streams[0].gain);
      const gainLevel = 10 ** (adjustedDecibels / 20);
      player.setVolume(gainLevel);
    } else {
      player.setVolume(volume.data / 150);
    }
  };

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
    if (nowPlaying) {
      player.applyTrackGain(nowPlaying.track);
    }
  }, [nowPlaying, player, volume.data]);

  useEffect(() => {
    if (player.isPlaying() && nowPlaying) {
      startTimer(nowPlaying);
      updateTimeline(nowPlaying.id, 'playing', player.currentPosition(), nowPlaying.track);
    }
  }, [nowPlaying, player, startTimer, updateTimeline]);

  player.clearTimer = () => window.clearInterval(timelineRef.current);

  player.startTimer = (queueItem: PlayQueueItem) => startTimer(queueItem);

  player.initTracks = (queue: PlayQueue, forcePlay: boolean = true) => {
    initialized.current = true;
    const currentIndex = queue.items.findIndex((item) => item.id === queue.selectedItemId);
    const current = queue.items[currentIndex];
    const next = queue.items[currentIndex + 1];
    player.removeAllTracks();
    if (next) {
      loadQueue.current.push(next);
    }
    if (current) {
      player.addTrack(library.trackSrc(current.track));
      player.applyTrackGain(current.track);
      if (forcePlay) {
        player.play();
        updateTimeline(current.id, 'playing', 0, current.track);
        startTimer(current);
      }
    }
  };

  player.resetApp = async () => {
    initialized.current = false;
    player.stop();
    await setQueueId(0);
    player.removeAllTracks();
    queryClient.removeQueries([QueryKeys.PLAYQUEUE]);
    queryClient.setQueryData(
      [QueryKeys.PLAYER_STATE],
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
          player.applyTrackGain(current.track);
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
      queryClient.removeQueries([QueryKeys.PLAYQUEUE]);
      queryClient.setQueryData(
        [QueryKeys.PLAYER_STATE],
        () => ({ duration: 0, isPlaying: false, position: 0 }),
      );
    }
  };

  player.onfinishedtrack = async () => {
    if (playQueue) {
      if (nowPlaying && settings.repeat === 'repeat-one') {
        await updateTimeline(nowPlaying.id, 'playing', 0, nowPlaying.track);
        queryClient.setQueryData(
          [QueryKeys.PLAYER_STATE],
          () => ({ duration: nowPlaying.track.duration, isPlaying: true, position: 0 }),
        );
        return;
      }
      const currentIndex = playQueue.items
        .findIndex((item) => item.id === playQueue.selectedItemId);
      const next = playQueue.items[currentIndex + 1];
      if (!next) {
        return;
      }
      if (nowPlaying) {
        player.applyTrackGain(next.track);
        await updateTimeline(nowPlaying.id, 'stopped', nowPlaying.track.duration, nowPlaying.track);
        await updateTimeline(next.id, 'playing', 0, next.track);
        await queryClient.refetchQueries([QueryKeys.PLAYQUEUE, queueId]);
        const newQueue = queryClient.getQueryData([QueryKeys.PLAYQUEUE, queueId]);
        player.updateTracks(newQueue, 'next');
        queryClient.setQueryData(
          [QueryKeys.PLAYER_STATE],
          () => ({ duration: next.track.duration, isPlaying: true, position: 0 }),
        );
        startTimer(next);
      }
    }
  };

  player.onload = async () => {
    queryClient.setQueryData(
      [QueryKeys.PLAYER_STATE],
      (
        current: Updater<PlayerState, PlayerState> | undefined,
      ) => ({ ...current, duration: player.currentLength(), position: player.getPosition() }),
    );
    const newTrack = loadQueue.current.shift();
    if (!newTrack) {
      const playerState = queryClient.getQueryData([QueryKeys.PLAYER_STATE]) as PlayerState;
      if (playerState.isPlaying) {
        player.play();
      }
      return;
    }
    if (player.playlist.trackNumber === 0) {
      player.addTrack(library.trackSrc(newTrack.track));
    }
    if (player.playlist.trackNumber === 1) {
      player.removeTrack(0);
      player.addTrack(library.trackSrc(newTrack.track));
      player.play();
    }
  };

  player.onplay = () => {
    window.electron.updatePlaying('playing', true);
    queryClient.setQueryData(
      [QueryKeys.PLAYER_STATE],
      (
        current: Updater<PlayerState, PlayerState> | undefined,
      ) => ({ ...current, isPlaying: true }),
    );
  };

  player.onpause = () => {
    window.electron.updatePlaying('playing', false);
    queryClient.setQueryData(
      [QueryKeys.PLAYER_STATE],
      (
        current: Updater<PlayerState, PlayerState> | undefined,
      ) => ({ ...current, isPlaying: false }),
    );
  };

  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
};

export default Player;
