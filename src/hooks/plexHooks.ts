import ky from 'ky';
import { useCallback } from 'react';
import { useLibrary } from 'queries/app-queries';

export const useUploadArt = () => {
  const library = useLibrary();

  const uploadArt = useCallback(async (id: number, data: string | ArrayBuffer | null) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${id}/arts`,
    );
    await ky.post(url, { body: data });
  }, [library]);

  return { uploadArt };
};

export const useLibraryMaintenance = () => {
  const library = useLibrary();

  const refreshMetadata = useCallback(async (id: number) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${id}/refresh`,
    );
    await ky.put(url);
  }, [library]);

  return { refreshMetadata };
};

export const useThumbnail = (src: string, size: number) => {
  const library = useLibrary();
  const url = library.api.getAuthenticatedUrl(src);
  const thumb = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: src || 'none',
      width: size,
      height: size,
      minSize: 1,
      upscale: 1,
    },
  );
  return [thumb, url];
};
