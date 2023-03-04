import axios from 'axios';
import { Country, Genre, Library, MediaType } from 'hex-plex';
import { Collection } from 'hex-plex/dist/types/collection';
import { Decade } from 'hex-plex/dist/types/decade';
import { Format } from 'hex-plex/dist/types/format';
import { Mood } from 'hex-plex/dist/types/mood';
import { Studio } from 'hex-plex/dist/types/studio';
import { Style } from 'hex-plex/dist/types/style';
import { Subformat } from 'hex-plex/dist/types/subformat';
import { Year } from 'hex-plex/dist/types/year';
import { IConfig } from 'types/interfaces';

type filterOptionsQueryFnParams = {
  config: IConfig,
  field: string,
  library: Library,
  type: MediaType,
};

export const filterOptionsQueryFn = async ({
  config, field, library, type,
}: filterOptionsQueryFnParams): Promise<
    Country[] | Genre[] | Style[] | Mood[] | Decade[] |
    Year[] | Format[] | Subformat[] | Collection[] | Studio[]
  > => {
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
  config: IConfig,
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
