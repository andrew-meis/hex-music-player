import Prism from '@zwolf/prism';
import { schema } from 'normalizr';

import { createParser } from './parser';

import { toFloat, toNumber } from './types';

const genreSchema = new schema.Entity('genre');

export interface Genre {
  _type: string,
  id: number,
  fastKey: string,
  score: number,
  title: string,
  type: string,
}

const toGenre = ($data: Prism<any>): Genre => ({
  _type: 'genre',
  id: $data.get<number>('id').value || $data.get<string>('key').transform(toNumber).value,

  fastKey: $data.get<string>('fastKey').value || $data.get<string>('key').value,
  score: $data.get<string>('score').transform(toFloat).value,
  title: $data.get<string>('title').value || $data.get<string>('tag').value,
  type: $data.get<string>('type').value,
});

const toGenreArray = ($data: Prism<any>): Genre[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const genresArray = $data
    .get('Directory')
    .toArray()
    .map(toGenre);

  return genresArray;
};

const parseGenreArray = createParser('genreArray', toGenreArray);

export { genreSchema, toGenre, toGenreArray, parseGenreArray };
