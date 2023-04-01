import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Style {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toStyle = ($data: Prism<any>): Style => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'style',
});

const toStyleArray = ($data: Prism<any>): Style[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const stylesArray = $data
    .get('Directory')
    .toArray()
    .map(toStyle);

  return stylesArray;
};

const parseStyleArray = createParser('styleArray', toStyleArray);

export { toStyle, toStyleArray, parseStyleArray };
