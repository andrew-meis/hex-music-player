import { useAtomValue } from 'jotai';
import ky from 'ky';
import { useCallback } from 'react';
import { libraryAtom } from 'root/Root';

export const useUploadArt = () => {
  const library = useAtomValue(libraryAtom);
  const uploadArt = useCallback(async (id: number, data: string | ArrayBuffer | null) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${id}/arts`,
    );
    await ky.post(url, { body: data });
  }, [library]);

  return { uploadArt };
};

export const useLibraryMaintenance = () => {
  const library = useAtomValue(libraryAtom);
  const refreshMetadata = useCallback(async (id: number) => {
    const url = library.api.getAuthenticatedUrl(
      `/library/metadata/${id}/refresh`,
    );
    await ky.put(url);
  }, [library]);

  return { refreshMetadata };
};

export const useThumbnail = (src: string, size: number) => {
  const library = useAtomValue(libraryAtom);
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
