import { useLibrary } from 'queries/app-queries';

// eslint-disable-next-line import/prefer-default-export
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
