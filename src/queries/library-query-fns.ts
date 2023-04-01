import ky from 'ky';
import { Library, MediaType } from 'api/index';
import { AppConfig } from 'types/interfaces';

type filterOptionsQueryFnParams = {
  config: AppConfig,
  field: string,
  library: Library,
  type: MediaType,
};

export interface MediaTag {
  id: number | string;
  fastKey: string;
  title: string;
  type: string;
}

export const filterOptionsQueryFn = async ({
  config, field, library, type,
}: filterOptionsQueryFnParams): Promise<MediaTag[]> => {
  switch (field) {
    case 'country':
      return library.countries(config.sectionId!);
    case 'genre':
      return library.genres(config.sectionId!, type);
    case 'style':
      return library.styles(config.sectionId!, type);
    case 'mood':
      return library.moods(config.sectionId!, type);
    case 'decade':
      return library.decades(config.sectionId!, type);
    case 'year':
      return library.years(config.sectionId!, type);
    case 'format':
      return library.formats(config.sectionId!, type);
    case 'subformat':
      return library.subformats(config.sectionId!, type);
    case 'collection':
      return library.collections(config.sectionId!, type);
    case 'studio':
      return library.studios(config.sectionId!, type);
    default:
      return [];
  }
};

type topLibraryQueryFnParams = {
  type: 8 | 9 | 10,
  config: AppConfig,
  library: Library,
  limit: number,
  start?: number,
  end?: number,
  seconds?: number,
}

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
    response = await ky(url).json() as Record<string, any>;
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
    response = await ky(url).json() as Record<string, any>;
  }
  return response;
};
