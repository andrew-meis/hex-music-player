import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Format {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toFormat = ($data: Prism<any>): Format => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'format',
});

const toFormatArray = ($data: Prism<any>): Format[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const formatsArray = $data
    .get('Directory')
    .toArray()
    .map(toFormat);

  return formatsArray;
};

const parseFormatArray = createParser('formatArray', toFormatArray);

export { toFormat, toFormatArray, parseFormatArray };
