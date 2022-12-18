import { QueryClient, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { useCallback } from 'react';
import { useLibrary } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';

const invalidateMetadataQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries([QueryKeys.ARTIST]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.LYRICS]);
  await queryClient.invalidateQueries([QueryKeys.PLAYQUEUE]);
  await queryClient.invalidateQueries([QueryKeys.PLAYLIST]);
  await queryClient.invalidateQueries([QueryKeys.TOP]);
};

export const useLibraryMaintenance = () => {
  const library = useLibrary();
  const queryClient = useQueryClient();

  const refreshMetadata = useCallback(async (id: number) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${id}/refresh`,
    );
    await axios.put(url);
    await invalidateMetadataQueries(queryClient);
  }, [library, queryClient]);

  return { refreshMetadata };
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
