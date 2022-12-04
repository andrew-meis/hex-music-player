import axios from 'axios';
import { Artist, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { parseHubContainer } from 'hex-plex/dist/types/hub';
import { deburr, isEmpty } from 'lodash';
import { useAccount, useConfig, useLibrary } from 'queries/app-queries';

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
      config?.sectionId!,
      { 'artist.id!': id, 'track.title': searchTerms || title },
    );
    const albumIds: number[] = [];
    response.tracks.forEach((track) => {
      if (track.originalTitle?.toLowerCase().includes(title.toLowerCase())) {
        albumIds.push(track.parentId);
      }
    });
    const { albums } = await library.albums(
      config?.sectionId!,
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
  return async ({
    id, title, guid, slice = 0, limit = 0,
  }: {
    id: Artist['id'],
    title: Artist['title'],
    guid: Artist['guid'],
    slice?: number,
    limit?: number,
  }) => {
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
    if (limit) {
      params.append('limit', limit.toString());
    }
    // eslint-disable-next-line prefer-template
    const url = library.api.uri
      + `/library/sections/${config?.sectionId!}`
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
