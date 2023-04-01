import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Year {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toYear = ($data: Prism<any>): Year => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'year',
});

const toYearArray = ($data: Prism<any>): Year[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const yearsArray = $data
    .get('Directory')
    .toArray()
    .map(toYear);

  return yearsArray;
};

const parseYearArray = createParser('yearArray', toYearArray);

export { toYear, toYearArray, parseYearArray };
