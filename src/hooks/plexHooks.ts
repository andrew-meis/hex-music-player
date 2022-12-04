import axios from 'axios';
import { useConfig, useLibrary } from 'queries/app-queries';

interface UseGetTopProps {
  type: 8 | 9 | 10
  limit: number,
  start?: number,
  end?: number,
  seconds?: number,
}

export const useGetTop = (
  { type, limit, start, end, seconds }: UseGetTopProps,
) => {
  const library = useLibrary();
  const { data: config } = useConfig();
  return async () => {
    let response;
    if (seconds) {
      const timestamp = Math.round((new Date()).getTime() / 1000);
      const url = library.api.getAuthenticatedUrl(
        '/library/all/top',
        {
          type,
          librarySectionID: config?.sectionId!,
          'viewedAt>': timestamp - seconds,
          'viewedAt<': timestamp,
          limit,
          accountID: 1,
        },
      );
      response = await axios.get(url);
    }
    if (!seconds) {
      const url = library.api.getAuthenticatedUrl(
        '/library/all/top',
        {
          type,
          librarySectionID: config?.sectionId!,
          'viewedAt>': start!,
          'viewedAt<': end!,
          limit,
          accountID: 1,
        },
      );
      response = await axios.get(url);
    }
    return response;
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
