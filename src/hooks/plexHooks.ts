import { useQueryClient } from '@tanstack/react-query';
import axios, { AxiosResponse } from 'axios';
import {
  Album,
  Artist, MediaType, Playlist, PlaylistItem,
} from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { parseHubContainer } from 'hex-plex/dist/types/hub';
import { deburr, isEmpty } from 'lodash';
import {
  useAccount, useConfig, useLibrary, useServer,
} from './queryHooks';
import useToast from './useToast';

export const useAddToPlaylist = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();
  const server = useServer();
  const toast = useToast();
  return async (id: Playlist['id'], key: string) => {
    const response = await library.addToPlaylist(
      id,
      `server://${server.clientIdentifier}/com.plexapp.plugins.library${key}`,
    );
    if (response.MediaContainer.leafCountAdded > 0) {
      await queryClient.refetchQueries(['playlist', id]);
      toast({ type: 'success', text: 'Added to playlist' });
    }
    if (!response || response.MediaContainer.leafCountAdded === 0) {
      toast({ type: 'error', text: 'No items added to playlist' });
    }
  };
};

export const useCreatePlaylist = () => {
  const library = useLibrary();
  const server = useServer();
  return async (title: string): Promise<AxiosResponse> => {
    const url = library.api.getAuthenticatedUrl(
      '/playlists',
      {
        title,
        smart: 0,
        type: 'audio',
        uri: `server://${server.clientIdentifier}/com.plexapp.plugins.libraryundefined`,
      },
    );
    return axios.post(url);
  };
};

export const useDeletePlaylist = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();
  const toast = useToast();
  return async (id: number) => {
    await library.deletePlaylist(id);
    await queryClient.refetchQueries(['playlists']);
    toast({ type: 'error', text: 'Deleted playlist' });
  };
};

export const useGetAlbum = () => {
  const library = useLibrary();
  return async (id: Album['id']) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${id}`,
      {
        includeRelated: 1,
        asyncAugmentMetadata: 1,
        augmentCount: 20,
        includeFields: 'musicAnalysis,thumbBlurHash',
      },
    );
    const response = await axios.get(url);
    const [album] = parseContainerType(MediaType.ALBUM, response.data.MediaContainer).albums;
    const related = parseHubContainer(response.data.MediaContainer.Metadata[0].Related);
    return {
      album,
      related: related.hubs[0]?.items,
    };
  };
};

export const useGetArtist = () => {
  const library = useLibrary();
  return async (artistId: Artist['id']) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${artistId}`,
      {
        includeChildren: 1,
        includePopularLeaves: 1,
        includeRelated: 1,
        includeRelatedCount: 20,
      },
    );
    const response = await axios.get(url);
    const { hubs } = parseHubContainer(response.data.MediaContainer.Metadata[0].Related);
    const filterIds: number[] = [];
    hubs.forEach((hub) => {
      if (hub.type === 'album') {
        hub.items.forEach((album) => filterIds.push(album.id));
      }
    });
    const { albums } = parseContainerType(
      MediaType.ALBUM,
      response.data.MediaContainer.Metadata[0].Children,
    );
    return {
      albums: albums.filter((album) => !filterIds.includes(album.id)),
      artist: parseContainerType(MediaType.ARTIST, response.data.MediaContainer).artists[0],
      hubs,
    };
  };
};

export const useGetArtistAppearances = () => {
  const library = useLibrary();
  const { data: config } = useConfig();
  return async (id: Artist['id'], title: Artist['title'], guid: Artist['guid']) => {
    let searchTerms;
    if (title !== deburr(title)) {
      const searchTitle = title.replace(/[^\w ]/, ' ');
      searchTerms = searchTitle
        .split(' ')
        .filter((term) => term.length > 2)
        .filter((term) => term.toLowerCase() !== 'the')
        .join(',');
    }
    const response = await library.tracks(
      config.sectionId as number,
      { 'artist.id!': id, 'track.title': searchTerms || title },
    );
    const albumIds: number[] = [];
    response.tracks.forEach((track) => {
      if (track.originalTitle?.toLowerCase().includes(title.toLowerCase())) {
        albumIds.push(track.parentId);
      }
    });
    const { albums } = await library.albums(
      config.sectionId as number,
      // @ts-ignore
      { 'album.id': albumIds, sort: 'originallyAvailableAt:desc' },
    );
    const appearsOnFilter = window.electron.readFilters('filters');
    if (isEmpty(appearsOnFilter)) {
      return albums;
    }
    const [hasFilteredAlbums] = appearsOnFilter.filter((filter) => filter.artist === guid);
    if (hasFilteredAlbums) {
      return albums.filter((album) => !hasFilteredAlbums.exclusions.includes(album.guid));
    }
    return albums;
  };
};

export const useGetArtistTracks = () => {
  const account = useAccount();
  const library = useLibrary();
  const { data: config } = useConfig();
  return async (
    id: Artist['id'],
    title: Artist['title'],
    guid: Artist['guid'],
    slice = 0,
  ) => {
    const params = new URLSearchParams();
    params.append('push', '1');
    params.append('artist.id', id.toString());
    params.append('or', '1');
    params.append('track.title', title);
    params.append('or', '1');
    params.append('track.artist', title);
    params.append('pop', '1');
    params.append('group', 'guid');
    params.append('sort', 'viewCount:desc,originallyAvailableAt:desc');
    params.append('type', MediaType.TRACK.toString());
    const url = library.api.uri
      + `/library/sections/${config.sectionId}`
      + `/all?${params.toString()}`
      + `&X-Plex-Token=${account.authToken}`;
    const response = await axios.get(url, { headers: library.api.headers() });
    const parsedData = parseContainerType(MediaType.TRACK, response.data);
    const tracks = parsedData.tracks
      .filter((track) => (track.originalTitle?.toLowerCase().includes(title.toLowerCase()))
        || (track.grandparentId === id));
    const appearsOnFilter = window.electron.readFilters('filters');
    if (isEmpty(appearsOnFilter)) {
      if (slice) { return tracks.slice(0, slice); }
      return tracks;
    }
    const [hasFilteredAlbums] = appearsOnFilter.filter((obj) => obj.artist === guid);
    if (hasFilteredAlbums) {
      const filteredTracks = tracks
        .filter((track) => !hasFilteredAlbums.exclusions.includes(track.parentGuid));
      if (slice) { return filteredTracks.slice(0, slice); }
      return filteredTracks;
    }
    if (slice) { return tracks.slice(0, slice); }
    return tracks;
  };
};

export const useRemoveFromPlaylist = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();
  const toast = useToast();
  return async (playlistId: Playlist['id'], itemId: PlaylistItem['id']) => {
    await library.removeFromPlaylist(playlistId, itemId);
    await queryClient.refetchQueries(['playlist', playlistId]);
    toast({ type: 'error', text: 'Removed from playlist' });
  };
};

export const useThumbnail = (src: string, size: number) => {
  const library = useLibrary();
  return library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: src || 'none',
      width: size,
      height: size,
      minSize: 1,
      upscale: 1,
    },
  );
};
