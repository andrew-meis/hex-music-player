import axios from 'axios';
import { Library, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { parseHubContainer } from 'hex-plex/dist/types/hub';
import { IConfig } from 'types/interfaces';

export const albumQueryFn = async (id: number, library: Library) => {
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

export const albumSearchQueryFn = async (
  config: IConfig,
  library: Library,
  searchParams: Record<string, string>,
) => {
  const response = await library.albums(config.sectionId!, searchParams);
  return response.albums;
};

export const albumTracksQueryFn = async (id: number, library: Library) => {
  const response = await library.albumTracks(id);
  const { tracks } = response;
  return tracks;
};
