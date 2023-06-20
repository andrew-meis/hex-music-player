export interface Gapless5Options {
  tracks?: string | string[];
  useWebAudio?: boolean;
  useHTML5Audio?: boolean;
  startingTrack?: number | string;
  loadLimit?: number;
  logLevel?: number;
  loop?: boolean;
  mapKeys?: Record<string, string>;
  shuffle?: boolean;
  singleMode?: boolean;
  playbackRate?: number;
  exclusive?: boolean;
  volume?: number;
}

export interface Log {
  debug: (message: string) => void;
  info: (message: string) => void;
  log: (message: string) => void;
  warn: (message: string) => void;
  error: (message: string) => void;
}

export interface IsGapless5Source {
  audioPath: string;
  getLength: () => number;
  getPosition: () => number;
  getState: () => number;
  inPlayState: (checkStarting?: boolean) => boolean;
  isPlayActive: (checkStarting?: boolean) => boolean;
  load: () => void;
  play: (syncPosition?: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setPosition: (newPosition: number, boolResetPlay?: boolean) => void;
  setVolume: (volume: number) => void;
  state: number;
  stop: (resetPosition?: boolean) => void;
  tick: () => void;
  unload: (isError?: boolean) => void;
}

export interface IsGapless5FileList {
  add: (index: number, audioPath: string) => void;
  findTrack: (path: string) => number;
  getPlaylistIndex: (index: number) => number;
  getSourceIndexed: (index: number) => { index: number, source: IsGapless5Source };
  getTracks: () => string[];
  gotoTrack: (
    pointOrPath: number | string,
    forcePlay?: boolean,
    crossfadeEnabled?: boolean,
  ) => number;
  indexFromTrack: (pointOrPath: number | string) => number;
  isShuffled: () => boolean;
  lastIndex: (index: number, newList: Array<any>, oldList: Array<any>) => number;
  loadableTracks: () => Set<number>;
  loadLimit: number;
  numTracks: () => number;
  preserveCurrent: boolean;
  remove: (index: number) => void;
  removeAllTracks: (flushList: boolean) => void;
  setPlaybackRate: (rate: number) => void;
  setShuffle: (nextShuffle: boolean, preserveCurrent?: boolean) => void;
  setStartingTrack: (newStartingTrack: number | string) => void;
  shuffledIndices: number[];
  shuffleMode: boolean;
  shuffleRequest: boolean | null;
  sources: IsGapless5Source[];
  startingTrack: number | string;
  trackNumber: number;
  updateLoading: () => void;
}

export interface IsGapless5 {
  addTrack: (audioPath: string) => void;
  canShuffle: () => boolean;
  context: AudioContext;
  cue: () => void;
  currentLength: () => number;
  currentPosition: () => number;
  currentSource: () => IsGapless5Source | null;
  exclusive: boolean;
  findTrack: (path: string) => number | undefined;
  gainNode: GainNode | null;
  getIndex: (sourceIndex?: boolean) => number;
  getPosition: () => number;
  getTracks: () => string[] | undefined;
  gotoTrack: (
    pointOrPath: number | string,
    forcePlay?: boolean,
    allowOverride?: boolean,
  ) => void;
  keyMappings: Record<number, (e: KeyboardEvent) => void>;
  id: number;
  initialized: boolean;
  insertTrack: (point: number, audioPath: string) => void;
  isPlaying: () => boolean;
  isScrubbing: boolean;
  isShuffled: () => boolean | undefined;
  isSingleLoop: () => boolean;
  loop: boolean;
  mapKeys: (keyOptions: Record<keyof IsGapless5, string>) => void;
  next: (forcePlay?: boolean) => void;
  onEndedCallback: () => void;
  onFinishedScrubbing: () => void;
  onPlayAllowed: () => void;
  onStartedScrubbing: () => void;
  onerror: (audioPath: string, message: string) => void;
  onfinishedtrack: (audioPath: string) => void;
  onfinishedall: () => void;
  onload: (audioPath: string) => void;
  onloadstart: (audioPath: string) => void;
  onnext: (from: string, to: string) => void;
  onpause: (audioPath: string) => void;
  onplayrequest: (audioPath: string) => void;
  onplay: (audioPath: string) => void;
  onprev: (from: string, to: string) => void;
  onstop: (audioPath: string) => void;
  onunload: (audioPath: string) => void;
  ontick: (position: number, length: number) => void;
  pause: () => void;
  play: () => void;
  playpause: () => void;
  playbackRate: number;
  playlist: IsGapless5FileList | null;
  prev: (forceReset?: boolean) => void;
  prevtrack: () => void;
  queueTrack: (pointOrPath: number | string) => void;
  queuedTrack: number | string | null;
  removeAllTracks: (flushPlaylist?: boolean) => void;
  removeTrack: (pointOrPath: number | string) => void;
  replaceTrack: (point: number, audioPath: string) => void;
  scrubWidth: number;
  scrubPosition: number;
  setPlaybackRate: (rate: number) => void;
  setPosition: (position: number) => void;
  setVolume: (volume: number) => void;
  shuffle: (preserveCurrent?: boolean) => void;
  singleMode: boolean;
  stop: () => void;
  startingTrack: number | 'random';
  tickMS: number;
  toggleShuffle: () => void;
  totalTracks: () => number;
  useWebAudio: boolean;
  useHTML5Audio: boolean;
}
