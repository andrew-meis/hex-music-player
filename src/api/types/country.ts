import Prism from '@zwolf/prism';
import { createParser } from './parser';
import { toNumber } from './types';

export interface Country {
  id: number,
  fastKey: string,
  title: string,
  type: string,
}

const toCountry = ($data: Prism<any>): Country => ({
  id: $data.get('key').transform(toNumber).value,
  fastKey: $data.get<string>('fastKey').value,
  title: $data.get('title').value,
  type: 'country',
});

const toCountryArray = ($data: Prism<any>): Country[] => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  const countriesArray = $data
    .get('Directory')
    .toArray()
    .map(toCountry);

  return countriesArray;
};

const parseCountryArray = createParser('countryArray', toCountryArray);

export { parseCountryArray };
