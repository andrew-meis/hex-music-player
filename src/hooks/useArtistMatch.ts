import { useQueryClient } from '@tanstack/react-query';
import { ArtistContainer } from 'api/index';
import { QueryKeys } from 'types/enums';

const useArtistMatch = ({ name = '' }: {name: string}) => {
  const queryClient = useQueryClient();
  const artistData = queryClient.getQueryData([QueryKeys.ARTISTS]) as ArtistContainer;
  if (!artistData || name === '') return [];
  const { artists } = artistData;
  // eslint-disable-next-line max-len
  const regex = /\s([Ff]t\.?|[Ff]eaturing|[Ff]eat\.?|[Ww]ith|[Aa]nd|[Xx]|[Oo]f|[Dd]uet with|[Vv]s\.?|&|\+|w\/|×)\s|,\s|\/\s/gm;
  const separators = [
    'feat.',
    'feat',
    'featuring',
    'ft.',
    'ft',
    'duet with',
    'and',
    'x',
    'of',
    '&',
    ',',
    'with',
    '',
    'w/',
    'vs.',
    '+',
    '×',
  ];
  const nameSplit = name.split(regex).filter((str) => str !== undefined);
  const andIndexes = nameSplit.flatMap((str, i) => (str.toLowerCase() === 'and' ? i : []));
  const ampersandIndexes = nameSplit.flatMap((str, i) => (str === '&' ? i : []));
  if (andIndexes) {
    const newNames = andIndexes.map((n) => nameSplit.slice(n - 1, n + 2).join(' '));
    nameSplit.push(...newNames);
  }
  if (ampersandIndexes) {
    const newNames = ampersandIndexes.map((n) => nameSplit.slice(n - 1, n + 2).join(' '));
    nameSplit.push(...newNames);
  }
  const searchArray = nameSplit
    .filter((str) => !separators.includes(str.toLowerCase()))
    .map((str) => str.toLowerCase());
  const results = artists.filter((artist) => searchArray.includes(artist.title.toLowerCase()));
  return results;
};

export default useArtistMatch;
