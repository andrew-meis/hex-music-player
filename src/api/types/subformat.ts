import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Subformat {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toSubformat = ($data: Prism<any>): Subformat => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'subformat',
});

const toSubformatArray = ($data: Prism<any>): Subformat[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const subformatsArray = $data
    .get('Directory')
    .toArray()
    .map(toSubformat);

  return subformatsArray;
};

const parseSubformatArray = createParser('subformatArray', toSubformatArray);

export { toSubformat, toSubformatArray, parseSubformatArray };
