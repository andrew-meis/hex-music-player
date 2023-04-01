import ky from 'ky';
import { Library, parseAlbumContainer, parseHubContainer } from 'api/index';
import { AppConfig } from 'types/interfaces';

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
  const response = await ky(url).json() as Record<string, any>;
  const [album] = parseAlbumContainer(response).albums;
  const related = parseHubContainer(response.MediaContainer.Metadata[0].Related);
  return {
    album,
    related: related.hubs[0]?.items,
  };
};

export const albumSearchQueryFn = async (
  config: AppConfig,
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
