import { useCallback } from 'react';
import { v4 } from 'uuid';
import { Album, Artist, Genre, Playlist, PlayQueueItem, Track } from 'api/index';
import useQueue from 'hooks/useQueue';
import { useAccount, useLibrary, useQueueId, useServer } from 'queries/app-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { PlayActions } from 'types/enums';
import { isPlayQueueItem } from 'types/type-guards';

export interface PlayParams {
  album?: Album;
  artist?: Artist;
  genre?: Genre;
  key?: string;
  playlist?: Playlist;
  shuffle?: boolean;
  track?: Track;
  tracks?: Track[];
}

const usePlayback = () => {
  const account = useAccount();
  const library = useLibrary();
  const player = usePlayerContext();
  const queueId = useQueueId();
  const server = useServer();
  const {
    addToQueue,
    getQueue,
    playQueue,
    updateQueue,
    updateTimeline,
  } = useQueue();
  const { data: nowPlaying } = useNowPlaying();

  const serverUri = `server://${server.clientIdentifier}/com.plexapp.plugins.library`;

  const playAlbum = useCallback(async (album: Album, shuffle: boolean = false) => {
    const uri = `${serverUri}${album.key}`;
    const newQueue = await playQueue(uri, shuffle);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playAlbumAtTrack = useCallback(async (track: Track, shuffle: boolean = false) => {
    const uri = `${serverUri}${track.parentKey}`;
    const newQueue = await playQueue(uri, shuffle, track.key);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playArtist = useCallback(async (artist: Artist, shuffle: boolean = false) => {
    const uri = `${serverUri}${artist.key}`;
    const newQueue = await playQueue(uri, shuffle);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playArtistRadio = useCallback(async (artist: Artist) => {
    // eslint-disable-next-line max-len
    const uri = `${serverUri}/library/metadata/${artist.id}/station/${v4()}?type=10&maxDegreesOfSeparation=-1`;
    const newQueue = await playQueue(uri, false);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playGenre = useCallback(async (genre: Genre, shuffle: boolean = false) => {
    const uri = `library://abc/directory//library/sections/6/all?album.genre=${genre.id}`;
    const newQueue = await playQueue(uri, shuffle);
    player.initTracks(newQueue);
  }, [playQueue, player]);

  const playPlaylist = useCallback(async (
    playlist: Playlist,
    shuffle: boolean = false,
    key: string | undefined = undefined,
  ) => {
    const uri = `${serverUri}/playlists/${playlist.id}/items`;
    const newQueue = await playQueue(uri, shuffle, key);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playQueueItem = useCallback(async (item: PlayQueueItem) => {
    if (isPlayQueueItem(nowPlaying)) {
      await updateTimeline(nowPlaying.id, 'stopped', player.currentPosition(), nowPlaying.track);
    }
    await updateTimeline(item.id, 'playing', 0, item.track);
    const newQueue = await getQueue();
    await updateQueue(newQueue);
    player.initTracks(newQueue);
  }, [getQueue, nowPlaying, player, updateQueue, updateTimeline]);

  const playTrack = useCallback(async (track: Track, shuffle: boolean = false) => {
    const uri = `${serverUri}${track.key}`;
    const newQueue = await playQueue(uri, shuffle);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playTrackRadio = useCallback(async (track: Track) => {
    // eslint-disable-next-line max-len
    const uri = `${serverUri}/library/metadata/${track.id}/station/${v4()}?type=10&maxDegreesOfSeparation=-1`;
    const newQueue = await playQueue(uri, false);
    player.initTracks(newQueue);
  }, [playQueue, player, serverUri]);

  const playTracks = useCallback(async (
    tracks: Track[],
    shuffle: boolean = false,
    key: string = '',
  ) => {
    const ids = tracks.map((track) => track.id).join(',');
    const uri = library.buildLibraryURI(account.client.identifier, `/library/metadata/${ids}`);
    const newQueue = await playQueue(uri, shuffle, key);
    player.initTracks(newQueue);
  }, [account.client.identifier, library, playQueue, player]);

  const playUri = useCallback(async (
    uri: string,
    shuffle: boolean = false,
    key: string = '',
  ) => {
    const newUri = library.buildLibraryURI(account.client.identifier, uri);
    const newQueue = await playQueue(newUri, shuffle, key);
    player.initTracks(newQueue);
  }, [account.client.identifier, library, playQueue, player]);

  const playSwitch = useCallback(
    async (action: PlayActions, params: PlayParams) => {
      switch (action) {
        case PlayActions.ADD_TRACK:
          if (params.track && queueId === 0) {
            await playTrack(params.track);
            break;
          }
          if (params.track) {
            const newQueue = await addToQueue({
              newTracks: params.track, sendToast: true, next: true,
            });
            await updateQueue(newQueue);
            player.updateTracks(newQueue, 'update');
          }
          break;
        case PlayActions.ADD_TRACK_LAST:
          if (params.track && queueId === 0) {
            await playTrack(params.track);
            break;
          }
          if (params.track) {
            const newQueue = await addToQueue({
              newTracks: params.track, sendToast: true, end: true,
            });
            await updateQueue(newQueue);
            player.updateTracks(newQueue, 'update');
          }
          break;
        case PlayActions.ADD_TRACKS:
          if (params.album && queueId === 0) {
            await playAlbum(params.album);
            break;
          }
          if (params.album) {
            const newQueue = await addToQueue({
              newTracks: params.album, sendToast: true, next: true,
            });
            await updateQueue(newQueue);
            player.updateTracks(newQueue, 'update');
            break;
          }
          if (params.tracks) {
            const newQueue = await addToQueue({
              newTracks: params.tracks, sendToast: true, next: true,
            });
            await updateQueue(newQueue);
            player.updateTracks(newQueue, 'update');
          }
          break;
        case PlayActions.ADD_TRACKS_LAST:
          if (params.album && queueId === 0) {
            await playAlbum(params.album);
            break;
          }
          if (params.album) {
            const newQueue = await addToQueue({
              newTracks: params.album, sendToast: true, end: true,
            });
            await updateQueue(newQueue);
            player.updateTracks(newQueue, 'update');
            break;
          }
          if (params.tracks) {
            const newQueue = await addToQueue({
              newTracks: params.tracks, sendToast: true, end: true,
            });
            await updateQueue(newQueue);
            player.updateTracks(newQueue, 'update');
          }
          break;
        case PlayActions.DO_NOTHING:
          break;
        case PlayActions.PLAY_ALBUM:
          if (params.album) {
            await playAlbum(params.album, params.shuffle);
          }
          break;
        case PlayActions.PLAY_ALBUM_AT_TRACK:
          if (params.track) {
            await playAlbumAtTrack(params.track, params.shuffle);
          }
          break;
        case PlayActions.PLAY_ARTIST:
          if (params.artist) {
            await playArtist(params.artist, params.shuffle);
          }
          break;
        case PlayActions.PLAY_ARTIST_RADIO:
          if (params.artist) {
            await playArtistRadio(params.artist);
          }
          break;
        case PlayActions.PLAY_GENRE:
          if (params.genre) {
            await playGenre(params.genre, params.shuffle);
          }
          break;
        case PlayActions.PLAY_PLAYLIST:
          if (params.playlist) {
            await playPlaylist(params.playlist, params.shuffle);
          }
          break;
        case PlayActions.PLAY_TRACK:
          if (params.track) {
            await playTrack(params.track, params.shuffle);
          }
          break;
        case PlayActions.PLAY_TRACK_RADIO:
          if (params.track) {
            await playTrackRadio(params.track);
          }
          break;
        case PlayActions.PLAY_TRACKS:
          if (params.tracks) {
            await playTracks(params.tracks, params.shuffle, params.key);
          }
          break;
        default: break;
      }
    },
    [
      addToQueue,
      playAlbum,
      playAlbumAtTrack,
      playArtist,
      playArtistRadio,
      playGenre,
      playPlaylist,
      playTrack,
      playTrackRadio,
      playTracks,
      player,
      queueId,
      updateQueue,
    ],
  );

  return {
    playAlbum,
    playAlbumAtTrack,
    playArtist,
    playArtistRadio,
    playPlaylist,
    playQueueItem,
    playSwitch,
    playTrack,
    playTrackRadio,
    playTracks,
    playUri,
  };
};

export default usePlayback;
