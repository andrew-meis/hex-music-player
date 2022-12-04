import axios from 'axios';
import { Library } from 'hex-plex';
import { IConfig } from 'types/interfaces';

type topLibraryQueryFnParams = {
  type: 8 | 9 | 10,
  config: IConfig,
  library: Library,
  limit: number,
  start?: number,
  end?: number,
  seconds?: number,
}

// eslint-disable-next-line import/prefer-default-export
export const topLibraryQueryFn = async ({
  type, config, library, limit, start, end, seconds,
}: topLibraryQueryFnParams) => {
  let response;
  if (seconds) {
    const timestamp = Math.round((new Date()).getTime() / 1000);
    const url = library.api.getAuthenticatedUrl(
      '/library/all/top',
      {
        type,
        librarySectionID: config.sectionId!,
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
        librarySectionID: config.sectionId!,
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
