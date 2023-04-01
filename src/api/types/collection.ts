import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Collection {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toCollection = ($data: Prism<any>): Collection => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'collection',
});

const toCollectionArray = ($data: Prism<any>): Collection[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const collectionsArray = $data
    .get('Directory')
    .toArray()
    .map(toCollection);

  return collectionsArray;
};

const parseCollectionArray = createParser('collectionArray', toCollectionArray);

export { toCollection, toCollectionArray, parseCollectionArray };
