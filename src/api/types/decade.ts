import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Decade {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toDecade = ($data: Prism<any>): Decade => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'decade',
});

const toDecadeArray = ($data: Prism<any>): Decade[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const decadesArray = $data
    .get('Directory')
    .toArray()
    .map(toDecade);

  return decadesArray;
};

const parseDecadeArray = createParser('decadeArray', toDecadeArray);

export { toDecade, toDecadeArray, parseDecadeArray };
