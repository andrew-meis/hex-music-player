/* eslint-disable no-plusplus */
/*
 *
 * Gapless 5: Gapless JavaScript/CSS audio player for HTML5
 *
 * Version 1.3.16
 * Copyright 2014 Rego Sen
 *
*/
import {
  Gapless5Options, IsGapless5, IsGapless5FileList, IsGapless5Source, Log,
} from './Interfaces';

declare global {
  interface Window {
    Gapless5AudioContext: AudioContext;
    webkitAudioContext: typeof AudioContext;
  }
}

/* eslint-disable key-spacing */
const Gapless5State = {
  None     : 0,
  Loading  : 1,
  Starting : 2,
  Play     : 3,
  Stop     : 4,
  Error    : 5,
};
/* eslint-enable key-spacing */

const LogLevel = {
  Debug: 1, // show log.debug and up
  Info: 2, // show log.info and up
  Warning: 3, // show log.warn and up
  Error: 4, // show log.error and up
  None: 5, // show nothing
};

const gapless5Players = {} as Record<number | string, IsGapless5>;

// A Gapless5Source "class" handles track-specific audio requests
function Gapless5Source(
  this: IsGapless5Source,
  parentPlayer: IsGapless5,
  parentLog: Log,
  inAudioPath: string,
) {
  this.audioPath = inAudioPath;
  const player = parentPlayer;
  const log = parentLog;

  // HTML5 Audio
  let audio: HTMLAudioElement | null = null;

  // WebAudio
  let source: AudioBufferSourceNode | null = null;
  let buffer: AudioBuffer | null = null;
  let request: FileReader | XMLHttpRequest | null = null;

  // states
  let lastTick = 0;
  let position = 0;
  let endpos = 0;
  let queuedState = Gapless5State.None;
  let state = Gapless5State.None;
  let loadedPercent = 0;
  let endedCallback: number | null = null;

  const setEndedCallbackTime = (restSecNormalized: number) => {
    if (endedCallback) {
      window.clearTimeout(endedCallback);
    }
    const restSec = restSecNormalized / player.playbackRate;
    log.debug(`onEnded() will be called in ${restSec.toFixed(2)} sec`);
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    endedCallback = window.setTimeout(onEnded, restSec * 1000);
  };

  const onEnded = () => {
    if (state === Gapless5State.Play) {
      setEndedCallbackTime(endpos / 1000);
      player.onEndedCallback();
    }
  };

  const setState = (newState: number) => {
    if (state !== newState && newState === Gapless5State.Play) {
      lastTick = new Date().getTime();
    }
    state = newState;
    queuedState = Gapless5State.None;
  };

  this.setVolume = (volume: number) => {
    if (audio !== null) {
      audio.volume = volume;
    }
  };

  this.getState = () => state;

  this.unload = (isError) => {
    this.stop();
    setState(isError ? Gapless5State.Error : Gapless5State.None);
    if (request) {
      request.abort();
    }
    audio = null;
    source = null;
    buffer = null;
    position = 0;
    endpos = 0;
    player.onunload(this.audioPath);
  };

  const parseError = (error: DOMException | Event | string | null) => {
    if (typeof error === 'string') return error;
    if (error instanceof DOMException) return error.message;
    if (error instanceof Event) return 'Error playing Gapless 5 audio';
    return 'Error playing Gapless 5 audio';
  };

  const onError = (error: DOMException | Event | string | null) => {
    const message = parseError(error);
    log.error(message);
    player.onerror(this.audioPath, message);
    this.unload(true);
  };

  const isErrorStatus = (status: number) => status / 100 >= 4;

  const playAudioFile = (syncPosition: boolean) => {
    if (this.inPlayState(true)) {
      return;
    }
    position = Math.max(position, 0);
    if (!Number.isFinite(position) || position >= this.getLength()) {
      position = 0;
    }
    const looped = player.isSingleLoop();

    if (buffer !== null) {
      setState(Gapless5State.Starting);
      player.context.resume().then(() => {
        if (state === Gapless5State.Starting && buffer) {
          log.debug(`Playing WebAudio${looped ? ' (looped)' : ''}: ${this.audioPath}`);
          source = player.context.createBufferSource();
          source.buffer = buffer;
          source.playbackRate.value = player.playbackRate;
          source.loop = looped;
          source.connect(player.gainNode!);

          const offsetSec = (syncPosition && audio) ? audio.currentTime : (position / 1000);
          source.start(0, offsetSec);
          setState(Gapless5State.Play);
          player.onplay(this.audioPath);
          setEndedCallbackTime(source.buffer.duration - offsetSec);
          if (audio) {
            audio.pause();
          }
        } else if (source) {
          source.stop();
        }
      });
    } else if (audio !== null) {
      const offsetSec = position / 1000;
      audio.currentTime = offsetSec;
      audio.volume = player.gainNode!.gain.value;
      audio.loop = looped;
      audio.playbackRate = player.playbackRate;

      setState(Gapless5State.Starting);
      audio.play().then(() => {
        if (state === Gapless5State.Starting) {
          log.debug(`Playing HTML5 Audio${looped ? ' (looped)' : ''}: ${this.audioPath}`);
          setState(Gapless5State.Play);
          player.onplay(this.audioPath);
          setEndedCallbackTime(audio!.duration - offsetSec);
        } else {
          audio!.pause();
        }
      });
    }
  };

  const onLoadedWebAudio = (inBuffer: AudioBuffer) => {
    if (!request) {
      return;
    }
    request = null;
    buffer = inBuffer;
    endpos = inBuffer.duration * 1000;

    if (queuedState === Gapless5State.Play && state === Gapless5State.Loading) {
      playAudioFile(true);
    } else if ((audio !== null) && (queuedState === Gapless5State.None) && this.inPlayState(true)) {
      log.debug(`Switching from HTML5 to WebAudio: ${this.audioPath}`);
      setState(Gapless5State.Stop);
      this.play(true);
    }
    if (state === Gapless5State.Loading) {
      state = Gapless5State.Stop;
    }

    player.onload(this.audioPath);
  };

  const onLoadedHTML5Audio = () => {
    if (state !== Gapless5State.Loading) {
      return;
    }

    state = Gapless5State.Stop;
    endpos = audio!.duration * 1000;

    if (queuedState === Gapless5State.Play) {
      playAudioFile(true);
    }
  };

  this.stop = () => {
    if (state === Gapless5State.None) {
      return;
    }
    log.debug(`Stopping: ${this.audioPath}`);

    if (player.useWebAudio) {
      if (source) {
        if (endedCallback) {
          window.clearTimeout(endedCallback);
          endedCallback = null;
        }
        source.stop(0);
      }
    }
    if (audio && state !== Gapless5State.Starting) {
      audio.pause();
    }

    setState(Gapless5State.Stop);
  };

  // PUBLIC FUNCTIONS

  this.inPlayState = (checkStarting = false) => (state === Gapless5State.Play
    || (checkStarting && state === Gapless5State.Starting));

  this.isPlayActive = (checkStarting = false) => (this.inPlayState(checkStarting)
    || queuedState === Gapless5State.Play);

  this.getPosition = () => position;

  this.getLength = () => endpos;

  this.play = (syncPosition = false) => {
    player.onPlayAllowed();
    if (state === Gapless5State.Loading) {
      log.debug(`Loading ${this.audioPath}`);
      queuedState = Gapless5State.Play;
    } else {
      playAudioFile(syncPosition);
    }
  };

  this.setPlaybackRate = (rate) => {
    if (source) {
      source.playbackRate.value = rate;
    }
    if (audio) {
      audio.playbackRate = rate;
    }
    setEndedCallbackTime((endpos - position) / 1000);
  };

  this.tick = () => {
    if (state === Gapless5State.Play) {
      const nextTick = new Date().getTime();
      const elapsed = nextTick - lastTick;
      position += (elapsed * player.playbackRate);
      lastTick = nextTick;
      const shouldLoop = player.isSingleLoop();
      if (source && source.loop !== shouldLoop) {
        source.loop = shouldLoop;
        log.debug(`Setting WebAudio loop to ${shouldLoop}`);
      }
      if (audio && audio.loop !== shouldLoop) {
        audio.loop = shouldLoop;
        log.debug(`Setting HTML5 audio loop to ${shouldLoop}`);
      }
    }

    if (loadedPercent < 1) {
      let newPercent = 1;
      if (state === Gapless5State.Loading) {
        newPercent = 0;
      } else if (audio && audio.seekable.length > 0) {
        newPercent = (audio.seekable.end(0) / audio.duration);
      }
      if (loadedPercent !== newPercent) {
        loadedPercent = newPercent;
      }
    }
  };

  this.setPosition = (newPosition, bResetPlay) => {
    if (bResetPlay && this.inPlayState()) {
      this.stop();
      position = newPosition;
      this.play();
    } else {
      position = newPosition;
    }
  };

  const fetchBlob = (audioPath: string, loader: (blob: Blob) => void) => {
    fetch(audioPath).then((response) => {
      if (response.ok) {
        response.blob().then((blob) => {
          loader(blob);
        });
      } else {
        onError(response.statusText);
      }
    }).catch((e: Error) => {
      onError(e.message);
    });
  };

  this.load = () => {
    if (state === Gapless5State.Loading) {
      return;
    }
    const { audioPath } = this;
    player.onloadstart(audioPath);
    state = Gapless5State.Loading;
    if (player.useWebAudio) {
      const onLoadWebAudio = (data: string | ArrayBuffer | null) => {
        if (typeof data === 'string') return;
        if (data) {
          player.context.decodeAudioData(data).then(
            (incomingBuffer) => {
              onLoadedWebAudio(incomingBuffer);
            },
          );
        }
      };
      if (audioPath.startsWith('blob:')) {
        fetchBlob(audioPath, (blob: Blob) => {
          request = new FileReader();
          request.onload = () => {
            if (request) {
              onLoadWebAudio((request as FileReader).result);
            }
          };
          request.readAsArrayBuffer(blob);
          if (request.error) {
            onError((request as FileReader).error);
          }
        });
      } else {
        request = new XMLHttpRequest();
        request.open('get', audioPath, true);
        request.timeout = 5 * 60 * 1000;
        request.responseType = 'arraybuffer';
        request.onload = () => {
          if (request) {
            onLoadWebAudio((request as XMLHttpRequest).response as ArrayBuffer);
          }
        };
        request.onerror = () => {
          if (request) {
            onError('Failed to load audio track');
          }
        };
        request.onloadend = () => {
          if (request && isErrorStatus((request as XMLHttpRequest).status)) {
            onError('Failed to load audio track');
          }
        };
        request.send();
      }
    }
    if (player.useHTML5Audio) {
      const getHtml5Audio = () => {
        const audioObj = new Audio();
        audioObj.controls = false;
        audioObj.preservesPitch = false;
        audioObj.addEventListener('canplaythrough', onLoadedHTML5Audio, false);
        audioObj.addEventListener('error', onError, false);
        return audioObj;
      };
      if (audioPath.startsWith('blob:')) {
        fetchBlob(audioPath, (blob: Blob) => {
          audio = getHtml5Audio();
          audio.srcObject = blob;
          audio.load();
        });
      } else {
        audio = getHtml5Audio();
        audio.src = audioPath;
        audio.load();
      }
    }
  };
}

// A Gapless5FileList "class". Processes an array of JSON song objects, taking
// the "file" members out to constitute the this.playlist.sources[] in the Gapless5 player
function Gapless5FileList(
  this: IsGapless5FileList,
  parentPlayer: IsGapless5,
  parentLog: Log,
  inShuffle: boolean = false,
  inLoadLimit: number = -1,
  inTracks: string[] = [],
  inStartingTrack: 'random' | number = 0,
) {
  const player = parentPlayer;
  const log = parentLog;

  // OBJECT STATE
  // Playlist and Track Items
  this.sources = []; // List of Gapless5Sources
  this.startingTrack = 0;
  this.trackNumber = -1; // Displayed track index in GUI

  // If the tracklist ordering changes, after a pre/next song,
  // the playlist needs to be regenerated
  this.shuffledIndices = [];
  this.shuffleMode = Boolean(inShuffle); // Ordered (false) or Shuffle (true)
  this.shuffleRequest = null;
  this.preserveCurrent = true;
  this.loadLimit = inLoadLimit;

  // PRIVATE METHODS

  this.setStartingTrack = (newStartingTrack) => {
    if (newStartingTrack === 'random') {
      this.startingTrack = Math.floor(Math.random() * this.sources.length);
    } else {
      this.startingTrack = newStartingTrack as number || 0;
    }
    log.debug(`Setting starting track to ${this.startingTrack}`);
    this.trackNumber = this.startingTrack;
  };

  // Going into shuffle mode. Remake the list
  const enableShuffle = (nextIndex: number) => {
    // Shuffle the list
    const indices = Array.from(Array(this.sources.length).keys());
    for (let n = 0; n < indices.length - 1; n++) {
      const k = n + Math.floor(Math.random() * (indices.length - n));
      [indices[k], indices[n]] = [indices[n], indices[k]];
    }

    if (this.preserveCurrent && this.trackNumber === indices[nextIndex]) {
      // make sure our current shuffled index matches what is playing
      // eslint-disable-next-line max-len
      [indices[this.trackNumber], indices[nextIndex]] = [indices[nextIndex], indices[this.trackNumber]];
    }

    // if shuffle happens to be identical to original list (more likely with fewer tracks),
    // swap another two tracks
    if (JSON.stringify(indices) === JSON.stringify(Array.from(Array(this.sources.length).keys()))) {
      const subIndices = indices.filter((index) => index !== this.trackNumber);
      const subIndex1 = Math.floor(Math.random() * (subIndices.length));
      const subIndex2 = (subIndex1 + 1) % subIndices.length;
      const index1 = indices[subIndices[subIndex1]];
      const index2 = indices[subIndices[subIndex2]];
      [indices[index1], indices[index2]] = [indices[index2], indices[index1]];
    }

    this.shuffledIndices = indices;
    this.shuffleMode = true;
    log.debug(`Shuffled tracks: ${this.shuffledIndices}`);
    return nextIndex;
  };

  // Leaving shuffle mode.
  const disableShuffle = (nextIndex: number) => {
    this.shuffleMode = false;
    log.debug('Disabling shuffle');

    if (this.preserveCurrent && this.shuffledIndices[this.trackNumber] === nextIndex) {
      // avoid playing the same track twice, skip to next track
      return (nextIndex + 1) % this.numTracks();
    }
    return nextIndex;
  };

  this.gotoTrack = (pointOrPath, forcePlay, allowOverride) => {
    const { index: prevIndex, source: prevSource } = this.getSourceIndexed(this.trackNumber);
    const wasPlaying = prevSource.isPlayActive();
    const requestedIndex = this.indexFromTrack(pointOrPath);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const updateShuffle = (nextIndex: number) => {
      if (this.shuffleRequest !== null) {
        if (this.shuffleRequest) {
          this.shuffleRequest = null;
          return enableShuffle(nextIndex);
        }
        this.shuffleRequest = null;
        return disableShuffle(nextIndex);
      }
      return nextIndex;
    };

    this.trackNumber = allowOverride ? requestedIndex : requestedIndex;
    log.debug(`Setting track number to ${this.trackNumber}`);
    this.updateLoading();

    const { index: nextIndex, source: nextSource } = this.getSourceIndexed(this.trackNumber);

    if (prevIndex === nextIndex) {
      if (forcePlay || (wasPlaying && !player.isSingleLoop())) {
        prevSource.stop();
        prevSource.play();
      }
      return this.trackNumber;
    }

    prevSource.setPosition(0);
    prevSource.stop();
    if (forcePlay || wasPlaying) {
      nextSource.play();
    }

    return this.trackNumber;
  };

  // PUBLIC METHODS
  // After a shuffle or unshuffle, the array has changed. Get the index
  // for the current-displayed song in the previous array.
  this.lastIndex = (index, newList, oldList) => {
    const compare = newList[index];
    // Cannot compare full objects after clone() :(
    // Instead, compare the generated index
    for (let n = 0; n < oldList.length; n++) {
      if (oldList[n].index === compare.index) {
        return n;
      }
    }

    // Default value, in case some array value was removed
    return 0;
  };

  this.removeAllTracks = (flushList) => {
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].unload(); // also calls stop
    }
    if (flushList) {
      this.shuffledIndices = [];
      this.setStartingTrack(-1);
    }
    this.sources = [];
  };

  this.setPlaybackRate = (rate) => {
    for (let i = 0; i < this.sources.length; i++) {
      this.sources[i].setPlaybackRate(rate);
    }
  };

  // Toggle shuffle mode or not, and prepare for rebasing the playlist
  // upon changing to the next available song. NOTE that each function here
  // changes flags, so the logic must exclude any logic if a revert occurs.
  this.setShuffle = (nextShuffle, preserveCurrent = true) => {
    this.shuffleRequest = nextShuffle;
    this.preserveCurrent = preserveCurrent;
    if (!preserveCurrent) {
      enableShuffle(this.trackNumber);
    }
  };

  this.isShuffled = () => {
    if (this.shuffleRequest !== null) {
      return this.shuffleRequest;
    }
    return this.shuffleMode;
  };

  this.numTracks = () => this.sources.length;

  this.getTracks = () => {
    const tracks = [];
    for (let i = 0; i < this.numTracks(); i++) {
      const { source } = this.getSourceIndexed(i);
      tracks.push(source.audioPath);
    }
    return tracks;
  };

  this.indexFromTrack = (pointOrPath) => ((typeof pointOrPath === 'string')
    ? this.findTrack(pointOrPath)
    : pointOrPath);

  this.findTrack = (path) => this.getTracks().indexOf(path);

  this.getSourceIndexed = (index) => {
    const realIndex = this.shuffleMode ? this.shuffledIndices[index] : index;
    return { index: realIndex, source: this.sources[realIndex] };
  };

  // eslint-disable-next-line max-len
  this.getPlaylistIndex = (index) => (this.shuffleMode ? this.shuffledIndices.indexOf(index) : index);

  // inclusive start, exclusive end
  const generateIntRange = (first: number, last: number) => Array
    .from({ length: (1 + last - first) }, (_v, k) => k + first);

  // returns set of actual indices (not shuffled)
  this.loadableTracks = () => {
    if (this.loadLimit === -1) {
      return new Set(generateIntRange(0, this.sources.length));
    }
    // loadable tracks are a range where size=loadLimit, centered around current track
    const startTrack = Math.round(Math.max(0, this.trackNumber - ((this.loadLimit - 1) / 2)));
    const endTrack = Math
      .round(Math.min(this.sources.length, this.trackNumber + (this.loadLimit / 2)));
    const loadableIndices = new Set(generateIntRange(startTrack, endTrack));
    if (player.queuedTrack) {
      loadableIndices.add(this.indexFromTrack(player.queuedTrack));
    }
    log.debug(`Loadable indices: ${JSON.stringify([...loadableIndices])}`);
    return loadableIndices;
  };

  this.updateLoading = () => {
    const loadableSet = this.loadableTracks();

    this.sources.forEach((source, index) => {
      const playlistIndex = this.getPlaylistIndex(index);
      const shouldLoad = loadableSet.has(playlistIndex);
      if (shouldLoad === (source.getState() === Gapless5State.None)) {
        if (shouldLoad) {
          log.debug(`Loading track ${playlistIndex}: ${source.audioPath}`);
          source.load();
        } else {
          source.unload();
          log.debug(`Unloaded track ${playlistIndex}: ${source.audioPath}`);
        }
      }
    });
  };

  // Add a new song into the FileList object.
  this.add = (index, audioPath) => {
    const source = new (Gapless5Source as any)(player, log, audioPath);
    this.sources.splice(index, 0, source);

    // insert new index in random position
    this.shuffledIndices
      .splice(Math.floor(Math.random() * this.numTracks()), 0, this.numTracks() - 1);

    // Shift trackNumber if the insert file is earlier in the list
    if (index <= this.trackNumber || this.trackNumber === -1) {
      this.trackNumber += 1;
      if (this.trackNumber > 0) {
        log.debug(`Insertion shifted current track number to ${this.trackNumber}`);
      }
    }
    this.updateLoading();
  };

  // Remove a song from the FileList object.
  this.remove = (index) => {
    this.sources.splice(index, 1);
    this.shuffledIndices.splice(this.shuffledIndices.indexOf(index), 1);

    // Stay at the same song index, unless trackNumber is after the
    // removed index, or was removed at the edge of the list
    if (this.trackNumber > 0 && ((index < this.trackNumber) || (index >= this.numTracks() - 2))) {
      this.trackNumber -= 1;
      log.debug(`Decrementing track number to ${this.trackNumber}`);
    }
    this.updateLoading();
  };

  // process inputs from constructor
  if (inTracks.length > 0) {
    for (let i = 0; i < inTracks.length; i++) {
      this.sources.push(new (Gapless5Source as any)(player, log, inTracks[i]));
      this.shuffledIndices
        .splice(Math.floor(Math.random() * this.numTracks()), 0, this.numTracks() - 1);
    }
    this.setStartingTrack(inStartingTrack);
    this.updateLoading();
  }
}

function Gapless5(this: IsGapless5, options: Gapless5Options) {
  // UI
  this.scrubWidth = 0;
  this.scrubPosition = 0;
  this.isScrubbing = false;

  // System
  let tickCallback: number | null = null;
  this.tickMS = 27; // fast enough for numbers to look real-time
  this.initialized = false;
  const log: Log = {
    debug: () => {},
    info: () => {},
    log: () => {},
    warn: () => {},
    error: () => {},
  };
  switch (options.logLevel || LogLevel.Info) {
  /* eslint-disable no-fallthrough, no-console */
    case LogLevel.Debug:
      log.debug = console.debug;
    case LogLevel.Info:
      log.info = console.info;
    case LogLevel.Warning:
      log.warn = console.warn;
    case LogLevel.Error:
      log.error = console.error;
    case LogLevel.None:
    default:
      break;
  /* eslint-enable no-fallthrough, no-console */
  }
  this.playlist = null;
  this.loop = options.loop || false;
  this.singleMode = options.singleMode || false;
  this.exclusive = options.exclusive || false;
  this.queuedTrack = null;

  const tick = () => {
    const source = this.currentSource();
    if (source) {
      source.tick();
      this.ontick(source.getPosition(), source.getLength());
    }
    if (tickCallback) {
      window.clearTimeout(tickCallback);
    }
    tickCallback = window.setTimeout(tick, this.tickMS);
  };

  // This is a hack to activate WebAudio on certain iOS versions
  // eslint-disable-next-line max-len
  const silenceWavData = 'data:audio/wav;base64,UklGRigAAABXQVZFZm10IBIAAAABAAEARKwAAIhYAQACABAAAABkYXRhAgAAAAEA';
  let playAllowed = false; // true after user initiates action
  const stubAudio = new Audio();
  stubAudio.controls = false;
  stubAudio.loop = true;
  stubAudio.src = silenceWavData;
  stubAudio.load();
  this.onPlayAllowed = () => {
    if (!playAllowed) {
      playAllowed = true;
      stubAudio.play().then(() => {
        stubAudio.pause();
      });
    }
  };

  // these default to true if not defined
  this.useWebAudio = options.useWebAudio !== false;
  this.useHTML5Audio = options.useHTML5Audio !== false;
  this.playbackRate = options.playbackRate || 1.0;
  this.id = Math.floor((1 + Math.random()) * 0x10000);
  gapless5Players[this.id] = this;

  // There can be only one AudioContext per window, so to have multiple players
  // we must define this outside the player scope
  if (window.Gapless5AudioContext === undefined) {
    const MaybeContext = window.AudioContext || window.webkitAudioContext;
    if (MaybeContext) {
      window.Gapless5AudioContext = new MaybeContext();
    }
  }
  this.context = window.Gapless5AudioContext;
  this.gainNode = (this.context !== undefined) ? this.context.createGain() : null;
  if (this.context && this.gainNode) {
    this.gainNode.gain.value = options.volume !== undefined ? options.volume : 1.0;
    this.gainNode.connect(this.context.destination);
  }

  // Callback and Execution logic
  this.keyMappings = {};

  // Callbacks
  this.onerror = () => {};
  this.onfinishedall = () => {};
  this.onfinishedtrack = () => {};
  this.onload = () => {}; // load completed
  this.onloadstart = () => {}; // load started
  this.onnext = () => {};
  this.onpause = () => {};
  this.onplay = () => {}; // play actually starts
  this.onplayrequest = () => {}; // play requested by user
  this.onprev = () => {};
  this.onstop = () => {};
  this.onunload = () => {};
  this.ontick = () => {};

  // INTERNAL HELPERS
  // Current index (if sourceIndex = true and shuffle is on, value will be different)
  this.getIndex = (sourceIndex = false) => {
    // FileList object must be initiated
    if (this.playlist !== null) {
      const { trackNumber } = this.playlist;
      return sourceIndex ? this.playlist.getSourceIndexed(trackNumber).index : trackNumber;
    }
    return -1;
  };

  const isValidIndex = (index: number) => {
    if (this.playlist) {
      return index >= 0 && index < this.playlist.numTracks();
    }
    return false;
  };

  // PUBLIC ACTIONS
  this.totalTracks = () => {
    // FileList object must be initiated
    if (this.playlist !== null) {
      return this.playlist.numTracks();
    }
    return 0;
  };

  this.isSingleLoop = () => this.loop && (this.singleMode || this.totalTracks() === 1);

  this.mapKeys = (keyOptions) => {
    Object.keys(keyOptions).forEach((key) => {
      const uppercode = key.toUpperCase().charCodeAt(0);
      const lowercode = key.toLowerCase().charCodeAt(0);
      const player = gapless5Players[this.id];
      if (Gapless5.prototype.hasOwnProperty.call(player, key)) {
        this.keyMappings[uppercode] = player[key as keyof IsGapless5] as (e: KeyboardEvent) => void;
        this.keyMappings[lowercode] = player[key as keyof IsGapless5] as (e: KeyboardEvent) => void;
      } else {
        log.error(`Gapless5 mapKeys() error: no function named '${key}'`);
      }
    });
    document.addEventListener('keydown', (e) => {
      const keyCode = e.key.charCodeAt(0);
      if (keyCode in this.keyMappings) {
        this.keyMappings[keyCode](e);
      }
    });
  };

  this.getPosition = () => {
    if (this.currentSource()) {
      return this.currentSource()!.getPosition();
    }
    return 0;
  };

  this.setPosition = (position) => {
    if (this.currentSource()) {
      this.currentSource()?.setPosition(position, true);
    }
  };

  // volume is normalized between 0 and 1
  this.setVolume = (volume) => {
    this.gainNode!.gain.value = volume;
    if (this.currentSource()) {
      this.currentSource()!.setVolume(volume);
    }
  };

  this.onEndedCallback = () => {
    // we've finished playing the track
    let finishedAll = false;
    const source = this.currentSource();
    if (source) {
      const { audioPath } = source;
      if (this.queuedTrack) {
        this.gotoTrack(this.queuedTrack);
        this.queuedTrack = null;
      } else if (this.loop || this.getIndex() < this.totalTracks() - 1) {
        if (this.singleMode || this.totalTracks() === 1) {
          if (this.loop) {
            this.prev(false);
          }
        } else {
          source.stop();
          this.next(true);
        }
      } else {
        source.stop();
        source.setPosition(0);
        finishedAll = true;
      }
      this.onfinishedtrack(audioPath);
    }
    if (finishedAll) {
      this.onfinishedall();
    }
  };

  this.onStartedScrubbing = () => {
    this.isScrubbing = true;
  };

  this.onFinishedScrubbing = () => {
    this.isScrubbing = false;
    const source = this.currentSource();
    if (source) {
      if (source.inPlayState() && this.scrubPosition >= this.currentLength()) {
        this.next(true);
      } else {
        source.setPosition(this.scrubPosition, true);
      }
    }
  };

  this.addTrack = (audioPath) => {
    if (!this.playlist) return;
    const next = this.playlist.sources.length;
    this.playlist.add(next, audioPath);
  };

  this.insertTrack = (point, audioPath) => {
    if (!this.playlist) return;
    const numTracks = this.totalTracks();
    const safePoint = Math.min(Math.max(point, 0), numTracks);
    if (safePoint === numTracks) {
      this.addTrack(audioPath);
    } else {
      this.playlist.add(safePoint, audioPath);
    }
  };

  this.getTracks = () => this.playlist?.getTracks();

  this.findTrack = (path) => this.playlist?.findTrack(path);

  this.removeTrack = (pointOrPath) => {
    if (!this.playlist) return;
    const point = this.playlist.indexFromTrack(pointOrPath);
    if (!isValidIndex(point)) {
      log.warn(`Cannot remove missing track: ${pointOrPath}`);
      return;
    }
    const deletedPlaying = point === this.playlist.trackNumber;

    const curSource = this.playlist.sources[point];
    if (!curSource) {
      return;
    }
    let wasPlaying = false;

    if (curSource.state === Gapless5State.Loading) {
      curSource.unload();
    } else if (curSource.inPlayState(true)) {
      wasPlaying = true;
      curSource.stop();
    }

    this.playlist.remove(point);

    if (deletedPlaying) {
      this.next(); // Don't stop after a delete
      if (wasPlaying) {
        this.play();
      }
    }
  };

  this.replaceTrack = (point, audioPath) => {
    this.removeTrack(point);
    this.insertTrack(point, audioPath);
  };

  this.removeAllTracks = (flushPlaylist = true) => {
    if (!this.playlist) return;
    this.playlist.removeAllTracks(flushPlaylist);
  };

  this.isShuffled = () => this.playlist?.isShuffled();

  // shuffles, re-shuffling if previously shuffled
  this.shuffle = (preserveCurrent = true) => {
    if (!this.canShuffle() || !this.playlist) {
      return;
    }
    this.playlist.setShuffle(true, preserveCurrent);
  };

  // toggles between shuffled and unshuffled
  this.toggleShuffle = () => {
    if (this.canShuffle() && this.playlist) {
      this.playlist.setShuffle(!this.isShuffled());
    }
  };

  this.currentSource = () => {
    if (this.totalTracks() > 0 && this.playlist) {
      return this.playlist.sources[this.getIndex(true)];
    }
    return null;
  };
  this.currentLength = () => (this.currentSource()?.getLength() || 0);
  this.currentPosition = () => (this.currentSource()?.getPosition() || 0);

  this.setPlaybackRate = (rate) => {
    if (!this.playlist) return;
    tick(); // tick once here before changing the playback rate, to maintain correct position
    this.playbackRate = rate;
    this.playlist.setPlaybackRate(rate);
  };

  this.queueTrack = (pointOrPath) => {
    if (!this.playlist) return;
    if (!isValidIndex(this.playlist.indexFromTrack(pointOrPath))) {
      log.error(`Cannot queue missing track: ${pointOrPath}`);
    } else {
      this.queuedTrack = pointOrPath;
      this.playlist.updateLoading();
    }
  };

  this.gotoTrack = (pointOrPath, forcePlay = false, allowOverride = false) => {
    if (!this.playlist) return;
    if (!isValidIndex(this.playlist.indexFromTrack(pointOrPath))) {
      log.error(`Cannot go to missing track: ${pointOrPath}`);
    } else {
      this.playlist.gotoTrack(pointOrPath, forcePlay, allowOverride);
    }
  };

  this.prevtrack = () => {
    const currentSource = this.currentSource();
    if (!currentSource) {
      return;
    }
    let track = 0;
    if (this.getIndex() > 0) {
      track = this.getIndex() - 1;
    } else if (this.loop) {
      track = this.totalTracks() - 1;
    } else {
      return;
    }
    this.gotoTrack(track);
    const newSource = this.currentSource()!;
    this.onprev(currentSource.audioPath, newSource.audioPath);
  };

  this.prev = (forceReset) => {
    const currentSource = this.currentSource();
    if (!currentSource) {
      return;
    }
    let wantsCallback = true;
    let track = 0;
    const playlistIndex = this.getIndex();
    if (currentSource.getPosition() > 0) {
      currentSource.setPosition(0, forceReset);
      track = playlistIndex;
      wantsCallback = false;
    } else if (this.singleMode && this.loop) {
      track = playlistIndex;
    } else if (playlistIndex > 0) {
      track = playlistIndex - 1;
    } else if (this.loop) {
      track = this.totalTracks() - 1;
    } else {
      return;
    }

    if (wantsCallback) {
      this.gotoTrack(track, forceReset, true);
      const newSource = this.currentSource()!;
      this.onprev(currentSource.audioPath, newSource.audioPath);
    }
  };

  this.next = (forcePlay) => {
    const currentSource = this.currentSource();
    if (!currentSource) {
      return;
    }
    let track = 0;
    const playlistIndex = this.getIndex();
    if (this.singleMode) {
      track = playlistIndex;
    } else if (playlistIndex < this.totalTracks() - 1) {
      track = playlistIndex + 1;
    } else if (!this.loop) {
      return;
    }
    this.gotoTrack(track, forcePlay || this.isPlaying(), true);
    const newSource = this.currentSource()!;
    this.onnext(currentSource.audioPath, newSource.audioPath);
  };

  this.play = () => {
    const source = this.currentSource();
    if (!source) {
      return;
    }
    source.play();
    if (this.exclusive) {
      const { id } = this;
      Object.keys(gapless5Players).forEach((otherId) => {
        if (otherId !== id.toString()) {
          gapless5Players[otherId].stop();
        }
      });
    }
    this.onplayrequest(source.audioPath);
  };

  this.playpause = () => {
    const source = this.currentSource();
    if (source && source.inPlayState(true)) {
      this.pause();
    } else {
      this.play();
    }
  };

  this.cue = () => {
    if (this.currentPosition() > 0) {
      this.prev(true);
    }
    this.play();
  };

  this.pause = () => {
    const source = this.currentSource();
    if (source) {
      source.stop();
      this.onpause(source.audioPath);
    }
  };

  this.stop = () => {
    const source = this.currentSource();
    if (source) {
      source.stop();
      if (source.getPosition() > 0) {
        source.setPosition(0);
      }
      this.onstop(source.audioPath);
    }
  };

  // PUBLIC QUERIES AND CALLBACKS

  this.isPlaying = () => (!!(this.currentSource() && this.currentSource()!.inPlayState()));

  // INIT AND UI

  // Must have at least 3 tracks in order for shuffle button to work
  // If so, permanently turn on the shuffle toggle
  this.canShuffle = () => this.totalTracks() > 2;

  if (typeof Audio === 'undefined') {
    log.error('This player is not supported by your browser.');
    return;
  }

  // set up starting track number
  if ('startingTrack' in options) {
    if (typeof options.startingTrack === 'number') {
      this.startingTrack = options.startingTrack;
    } else if (options.startingTrack === 'random') {
      this.startingTrack = 'random';
    }
  }

  // set up key mappings
  if ('mapKeys' in options) {
    this.mapKeys(options.mapKeys!);
  }

  // set up tracks into a FileList object
  if ('tracks' in options) {
    let items = [] as string[];
    let startingTrack: number | string = 0;
    if (Array.isArray(options.tracks)) {
      if (typeof options.tracks[0] === 'string') {
        items = options.tracks;
        for (let i = 0; i < options.tracks.length; i++) {
          items[i] = options.tracks[i];
        }
        startingTrack = this.startingTrack || 0;
      }
    } else if (typeof options.tracks === 'string') {
      items[0] = options.tracks;
    }
    this.playlist = new (Gapless5FileList as any)(
      this,
      log,
      options.shuffle,
      options.loadLimit,
      items,
      startingTrack,
    );
  } else {
    this.playlist = new (Gapless5FileList as any)(
      this,
      log,
      options.shuffle,
      options.loadLimit,
    );
  }

  this.initialized = true;

  tick();
}

export {
  Gapless5,
  LogLevel,
};
