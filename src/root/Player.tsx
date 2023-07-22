import { useQueryClient } from '@tanstack/react-query';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { atomWithStorage } from 'jotai/utils';
import { isNumber } from 'lodash';
import React, {
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { PlayQueue, PlayQueueItem, Track } from 'api/index';
import { Gapless5, IsGapless5, LogLevel } from 'classes';
import useQueue from 'hooks/useQueue';
import { useCurrentQueue, useNowPlaying } from 'queries/plex-queries';
import { QueryKeys } from 'types/enums';
import { libraryAtom, queueIdAtom, settingsAtom } from './Root';

// STATE
export const playbackDurationAtom = atom(0);
export const playbackIsPlayingAtom = atom(false);
export const playbackProgressAtom = atom({
  duration: 0,
  position: 0,
});
export const volumeAtom = atomWithStorage('volume', 40, {
  getItem: (key, initialValue) => {
    const savedValue = window.electron.readConfig(key);
    if (!isNumber(savedValue)) return initialValue;
    return savedValue as number;
  },
  setItem: (key, newValue) => window.electron.writeConfig(key, newValue),
  removeItem: (key) => window.electron.writeConfig(key, 40),
});

interface Gapless5Extended extends IsGapless5 {
  applyTrackGain: (track: Track) => void;
  clearTimer: () => void;
  initTracks: (queue: PlayQueue, forcePlay?: boolean) => void;
  resetApp: () => void;
  startTimer: (queueItem: PlayQueueItem) => void;
  updateTracks: (queue: PlayQueue, action: 'next' | 'prev' | 'update') => void;
}

const playerOptions = {
  loadLimit: 2,
  useHTML5Audio: false,
  logLevel: LogLevel.Debug,
};

export const PlayerContext = React.createContext<Gapless5Extended | undefined>(undefined);

export const usePlayerContext = () => {
  const player = useContext(PlayerContext);
  if (!player) {
    throw new Error('No player');
  }

  return player;
};

const Player = ({ children }: {children: ReactNode}) => {
  const setDuration = useSetAtom(playbackDurationAtom);
  const [isPlaying, setIsPlaying] = useAtom(playbackIsPlayingAtom);
  const setProgress = useSetAtom(playbackProgressAtom);

  const volume = useAtomValue(volumeAtom);
  const initialized = useRef<boolean | null>(null);
  const loadQueue = useRef<PlayQueueItem[]>([]);
  const library = useAtomValue(libraryAtom);
  const queryClient = useQueryClient();
  const settings = useAtomValue(settingsAtom);
  const timelineRef = useRef(0);
  const [queueId, setQueueId] = useAtom(queueIdAtom);
  const { data: nowPlaying } = useNowPlaying();
  const { data: playQueue } = useCurrentQueue();
  const { updateTimeline } = useQueue();

  const player = useMemo(() => (new (Gapless5 as any)({
    ...playerOptions,
    loop: settings.repeat !== 'repeat-none',
    singleMode: settings.repeat === 'repeat-one',
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }) as Gapless5Extended), []);

  player.applyTrackGain = (track: Track) => {
    if (track.media[0].parts[0].streams[0].gain) {
      const decibelLevel = 20 * Math.log10(volume / 100);
      const adjustedDecibels = decibelLevel + (+track.media[0].parts[0].streams[0].gain);
      const gainLevel = 10 ** (adjustedDecibels / 20);
      player.setVolume(gainLevel);
    } else {
      player.setVolume(volume / 150);
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
  }, [nowPlaying, player, volume]);

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
    setQueueId(0);
    player.removeAllTracks();
    queryClient.removeQueries([QueryKeys.PLAYQUEUE]);
    setDuration(() => 0);
    setIsPlaying(() => false);
    setProgress({
      duration: 0,
      position: 0,
    });
  };

  player.updateTracks = (queue: PlayQueue, action: 'next' | 'prev' | 'update') => {
    if (!player.playlist) return;
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
      if (player.playlist.trackNumber === 0 && player.getTracks()!.length === 2) {
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
      if (player.playlist.trackNumber === 0 && player.getTracks()!.length === 1) {
        if (next) {
          player.replaceTrack(1, library.trackSrc(next.track));
        }
      }
      if (player.playlist.trackNumber === 0 && player.getTracks()!.length === 2) {
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
      setQueueId(0);
      player.removeAllTracks();
      queryClient.removeQueries([QueryKeys.PLAYQUEUE]);
      setDuration(() => 0);
      setIsPlaying(() => false);
    }
  };

  player.onfinishedtrack = async () => {
    if (playQueue) {
      if (nowPlaying && settings.repeat === 'repeat-one') {
        await updateTimeline(nowPlaying.id, 'playing', 0, nowPlaying.track);
        setDuration(() => nowPlaying.track.duration);
        setIsPlaying(() => true);
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
        const newQueue = queryClient.getQueryData([QueryKeys.PLAYQUEUE, queueId]) as PlayQueue;
        player.updateTracks(newQueue, 'next');
        setDuration(() => next.track.duration);
        setIsPlaying(() => true);
        startTimer(next);
      }
    }
  };

  player.onload = async () => {
    setDuration(() => player.currentLength());
    setIsPlaying(() => player.isPlaying());
    const newTrack = loadQueue.current.shift();
    if (!newTrack) {
      if (isPlaying) {
        player.play();
      }
      return;
    }
    if (!player.playlist) return;
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
    setDuration(() => player.currentLength());
    setIsPlaying(() => true);
    window.electron.updatePlaying('playing', true);
  };

  player.onpause = () => {
    setIsPlaying(() => false);
    window.electron.updatePlaying('playing', false);
  };

  player.ontick = (position, duration) => {
    setProgress(() => ({
      duration,
      position,
    }));
  };

  return (
    <PlayerContext.Provider value={player}>
      {children}
    </PlayerContext.Provider>
  );
};

export default Player;
