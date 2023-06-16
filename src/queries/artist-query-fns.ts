import ky from 'ky';
import { deburr, isEmpty } from 'lodash';
import { Account, Library, MediaType, parseContainerType, parseHubContainer } from 'api/index';
import { PlexSort, plexSort } from 'classes/index';
import { AlbumSortKeys, SortOrders } from 'types/enums';
import { AppConfig } from 'types/interfaces';

export const artistQueryFn = async (id: number, library: Library) => {
  const url = library.api.getAuthenticatedUrl(
    `/library/metadata/${id}`,
    {
      includeChildren: 1,
      includePopularLeaves: 1,
      includeRelated: 1,
      includeRelatedCount: 20,
    },
  );
  const response = await ky(url).json() as Record<string, any>;
  const { hubs } = parseHubContainer(response.MediaContainer.Metadata[0].Related);
  const filterIds: number[] = [];
  hubs.forEach((hub) => {
    if (hub.type === 'album') {
      hub.items.forEach((album) => filterIds.push(album.id));
    }
  });
  const { albums } = parseContainerType(
    MediaType.ALBUM,
    response.MediaContainer.Metadata[0].Children,
  );
  return {
    albums: albums.filter((album) => !filterIds.includes(album.id)),
    artist: parseContainerType(MediaType.ARTIST, response.MediaContainer).artists[0],
    hubs,
  };
};

export const artistAppearancesQueryFn = async (
  config: AppConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
) => {
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
    {
      'album.id': albumIds,
      sort: plexSort(AlbumSortKeys.RELEASE_DATE, SortOrders.DESC).stringify(),
    },
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

type artistTracksQueryFnParams = {
  config: AppConfig,
  library: Library,
  id: number,
  title: string,
  guid: string,
  sort: PlexSort,
  removeDupes?: boolean,
  slice?: number,
}

export const artistTracksQueryFn = async ({
  config, library, id, title, guid, sort, removeDupes = true, slice = 0,
}: artistTracksQueryFnParams) => {
  const account = library.api.parent as Account;
  const params = new URLSearchParams();
  params.append('push', '1');
  params.append('artist.id', id.toString());
  params.append('or', '1');
  params.append('track.title', title);
  params.append('or', '1');
  params.append('track.artist', title);
  params.append('pop', '1');
  if (removeDupes) params.append('group', 'guid');
  params.append('sort', sort.stringify());
  params.append('type', MediaType.TRACK.toString());
  params.append('X-Plex-Token', account.authToken);
  const url = `${library.api.uri}/library/sections/${config?.sectionId!}/all`;
  const response = await ky(
    url,
    { headers: library.api.headers(), searchParams: params },
  ).json() as Record<string, any>;
  const parsedData = parseContainerType(MediaType.TRACK, response);
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
