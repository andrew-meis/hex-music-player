import Prism from '@zwolf/prism';
import { createParser } from './parser';

export interface Studio {
  id: string,
  fastKey: string,
  title: string,
  type: string,
}

const toStudio = ($data: Prism<any>): Studio => ({
  id: $data.get<string>('title').value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'studio',
});

const toStudioArray = ($data: Prism<any>): Studio[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const studiosArray = $data
    .get('Directory')
    .toArray()
    .map(toStudio);

  return studiosArray;
};

const parseStudioArray = createParser('studioArray', toStudioArray);

export { toStudio, toStudioArray, parseStudioArray };
