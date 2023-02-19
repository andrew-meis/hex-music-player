import { useQueryClient } from '@tanstack/react-query';
import { ArtistContainer } from 'hex-plex';

const useArtistMatch = ({ name = '' }: {name: string}) => {
  const queryClient = useQueryClient();
  const artistData = queryClient.getQueryData(['artists']) as ArtistContainer;
  if (!artistData || name === '') return [];
  const { artists } = artistData;
  // eslint-disable-next-line max-len
  const regex = /\s([Ff]t\.?|[Ff]eaturing|[Ff]eat\.?|[Ww]ith|[Aa]nd|[Xx]|[Oo]f|[Vv]s\.?|&|w\/)\s|,\s|\/\s/gm;
  const separators = [
    'feat.',
    'feat',
    'featuring',
    'ft.',
    'ft',
    'and',
    'x',
    'of',
    '&',
    ',',
    'with',
    '',
    'w/',
    'vs.',
  ];
  const nameSplit = name
    .split(regex);
  const andIndexes = nameSplit.flatMap((str, i) => (str === 'and' ? i : []));
  if (andIndexes) {
    const newNames = andIndexes.map((n) => nameSplit.slice(n - 1, n + 2).join(' '));
    nameSplit.push(...newNames);
  }
  const searchArray = nameSplit.filter((str) => str !== undefined)
    .filter((str) => !separators.includes(str.toLowerCase()));
  const results = artists.filter((artist) => searchArray.includes(artist.title));
  return results;
};

export default useArtistMatch;
