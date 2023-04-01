import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Mood {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toMood = ($data: Prism<any>): Mood => ({
  id: $data.get<string>('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get<string>('title').value,
  type: 'mood',
});

const toMoodArray = ($data: Prism<any>): Mood[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const moodsArray = $data
    .get('Directory')
    .toArray()
    .map(toMood);

  return moodsArray;
};

const parseMoodArray = createParser('moodArray', toMoodArray);

export { toMood, toMoodArray, parseMoodArray };
