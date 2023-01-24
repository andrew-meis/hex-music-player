/* eslint-disable max-classes-per-file */
declare module '@regosen/gapless-5' {
    export class Gapless5 {
      constructor(options?: {}, deprecated?: {});

      hasGUI: boolean;

      scrubWidth: string | number;

      scrubPosition: number;

      isScrubbing: boolean;

      tickMS: number;

      initialized: boolean;

      uiDirty: boolean;

      playlist: Gapless5FileList;

      loop: any;

      singleMode: any;

      exclusive: any;

      queuedTrack: any;

      onPlayAllowed: () => void;

      useWebAudio: boolean;

      useHTML5Audio: boolean;

      playbackRate: any;

      id: number;

      context: any;

      gainNode: any;

      keyMappings: {};

      clearTimer: () => any;

      initTracks: (...params: any) => any;

      resetApp: () => void;

      startTimer: (...params: any) => any;

      updateTracks: (...params: any) => any;

      onprev: () => void;

      onplayrequest: () => void;

      onplay: () => void;

      onpause: () => void;

      onstop: () => void;

      onnext: () => void;

      onerror: () => void;

      onloadstart: () => void;

      onload: () => void;

      onunload: () => void;

      onfinishedtrack: () => void;

      onfinishedall: () => void;

      getIndex: (sourceIndex?: boolean) => any;

      totalTracks: () => number;

      isSingleLoop: () => any;

      mapKeys: (keyOptions: any) => void;

      getPosition: () => number;

      setPosition: (position: any) => void;

      setVolume: (volume: any) => void;

      setGain: (uiPos: any) => void;

      scrub: (uiPos: any, updateTransport?: boolean) => void;

      setLoadedSpan: (percent: any) => void;

      onEndedCallback: () => void;

      onStartedScrubbing: () => void;

      onFinishedScrubbing: () => void;

      addTrack: (audioPath: any) => void;

      insertTrack: (point: any, audioPath: any) => void;

      getTracks: () => any[];

      findTrack: (path: any) => number;

      removeTrack: (pointOrPath: any) => void;

      replaceTrack: (point: any, audioPath: any) => void;

      removeAllTracks: (flushPlaylist?: boolean) => void;

      isShuffled: () => any;

      shuffle: (preserveCurrent?: boolean) => void;

      toggleShuffle: () => void;

      shuffleToggle: () => void;

      currentSource: () => Gapless5Source;

      currentLength: () => number;

      currentPosition: () => number;

      setPlaybackRate: (rate: any) => void;

      queueTrack: (pointOrPath: any) => void;

      gotoTrack: (pointOrPath: any, forcePlay: any, allowOverride?: boolean) => void;

      prevtrack: () => void;

      prev: (uiEvent?: any, forceReset?: boolean) => void;

      next: (_uiEvent?: any, forcePlay?: boolean) => void;

      play: () => void;

      playpause: () => void;

      cue: () => void;

      pause: () => void;

      stop: () => void;

      isPlaying: () => boolean;

      canShuffle: () => boolean;

      startingTrack: any;
    }

    export namespace LogLevel {
        const Debug: number;
        const Info: number;
        const Warning: number;
        const Error: number;
        const None: number;
    }

    declare function Gapless5FileList(
      parentPlayer: any,
      parentLog: any,
      inShuffle: any,
      inLoadLimit?: number,
      inTracks?: any[],
      inStartingTrack?: number): void;

    declare class Gapless5FileList {
      constructor(
        parentPlayer: any,
        parentLog: any,
        inShuffle: any,
        inLoadLimit?: number,
        inTracks?: any[],
        inStartingTrack?: number
      );

      sources: Gapless5Source[];

      startingTrack: number;

      trackNumber: number;

      shuffledIndices: any[];

      shuffleMode: boolean;

      shuffleRequest: any;

      preserveCurrent: boolean;

      loadLimit: number;

      setStartingTrack: (newStartingTrack: any) => void;

      gotoTrack: (pointOrPath: any, forcePlay: any, allowOverride: any) => number;

      lastIndex: (index: any, newList: any, oldList: any) => number;

      removeAllTracks: (flushList: any) => void;

      setPlaybackRate: (rate: any) => void;

      setShuffle: (nextShuffle: any, preserveCurrent?: boolean) => void;

      isShuffled: () => any;

      numTracks: () => number;

      getTracks: () => any[];

      indexFromTrack: (pointOrPath: any) => any;

      findTrack: (path: any) => number;

      getSourceIndexed: (index: any) => {
            index: any;
            source: Gapless5Source;
        };

      getPlaylistIndex: (index: any) => any;

      loadableTracks: () => Set<any>;

      updateLoading: () => void;

      add: (index: any, audioPath: any) => void;

      remove: (index: any) => void;
    }

    declare function Gapless5Source(parentPlayer: any, parentLog: any, inAudioPath: any): void;

    declare class Gapless5Source {
      constructor(parentPlayer: any, parentLog: any, inAudioPath: any);

      audioPath: any;

      setVolume: (val: any) => void;

      getState: () => number;

      unload: (isError: any) => void;

      stop: () => void;

      inPlayState: (checkStarting: any) => boolean;

      isPlayActive: (checkStarting: any) => boolean;

      getPosition: () => number;

      getLength: () => number;

      play: (syncPosition: any) => void;

      setPlaybackRate: (rate: any) => void;

      tick: () => void;

      setPosition: (newPosition: any, bResetPlay: any) => void;

      load: () => void;
    }
}
