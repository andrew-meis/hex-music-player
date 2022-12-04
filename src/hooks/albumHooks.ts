import axios from 'axios';
import { Album, MediaType } from 'hex-plex';
import { parseContainerType } from 'hex-plex/dist/library';
import { parseHubContainer } from 'hex-plex/dist/types/hub';
import { useConfig, useLibrary } from 'queries/app-queries';

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

export const useGetAlbumQuery = () => {
  const library = useLibrary();
  const { data: config } = useConfig();
  return async (query: Record<string, string>) => {
    const response = await library.albums(config?.sectionId!, query);
    return response.albums;
  };
};
