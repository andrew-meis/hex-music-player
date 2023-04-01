import Prism from '@zwolf/prism';
import { schema } from 'normalizr';
import { toMediaContainer } from './media-container';
import { createParser } from './parser';
import { toNumber } from './types';

const sectionSchema = new schema.Entity('sections');

const sectionContainerSchema = new schema.Object({
  sections: new schema.Array(sectionSchema),
});

const toSection = ($data: Prism<any>) => ({
  _type: 'section',
  id: $data.get('key').transform(toNumber).value,
  allowSync: $data.get('allowSync').value,
  art: $data.get('art').value,
  composite: $data.get('composite').value,
  filters: $data.get('filters').value,
  refreshing: $data.get('refreshing').value,
  thumb: $data.get('thumb').value,
  key: $data.get('key').value,
  type: $data.get('type').value,
  title: $data.get('title').value,
  agent: $data.get('agent').value,
  scanner: $data.get('scanner').value,
  language: $data.get('language').value,
  uuid: $data.get('uuid').value,
  updatedAt: $data.get('updatedAt').value,
  createdAt: $data.get('createdAt').value,
  location: $data.get('Location').value,
});

const toSectionContainer = ($data: Prism<any>) => {
  if ($data.has('MediaContainer')) {
    // eslint-disable-next-line no-param-reassign
    $data = $data.get('MediaContainer');
  }

  return {
    ...$data.transform(toMediaContainer).value,

    _type: 'sectionContainer',

    title: $data.get('title1').value,
    sections: $data
      .get('Directory')
      .toArray()
      .map(toSection),
  };
};

const parseSectionContainer = createParser(
  'sectionContainer',
  toSectionContainer,
);

export { sectionSchema, sectionContainerSchema, parseSectionContainer };
