import Prism from '@zwolf/prism';

export interface Tag {
  id: number,
  filter: string,
  tag: string,
}

const toTag = ($data: Prism<any>): Tag => ({
  id: $data.get<number>('id', { quiet: true }).value,
  filter: $data.get<string>('filter', { quiet: true }).value,
  tag: $data.get<string>('tag').value,
});

const toTagList = ($data: Prism<any>) => $data.toArray().map(toTag);

export { toTagList };
