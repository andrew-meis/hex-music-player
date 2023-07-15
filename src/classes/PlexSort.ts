import { ColumnSort } from '@tanstack/react-table';
import { Track } from 'api/index';

const plexSortKeyMap: Partial<Record<keyof Track & 'random', string>> = {
  addedAt: 'addedAt',
  duration: 'duration',
  grandparentTitle: 'artist.titleSort',
  lastRatedAt: 'lastRatedAt',
  lastViewedAt: 'lastViewedAt',
  originalTitle: 'originalTitle',
  parentTitle: 'album.titleSort',
  parentYear: 'album.year',
  random: 'random',
  ratingCount: 'ratingCount',
  title: 'titleSort',
  userRating: 'userRating',
  viewCount: 'viewCount',
};

export class PlexSort {
  by: string;

  order: 'asc' | 'desc';

  constructor(by: string, order: 'asc' | 'desc') {
    this.by = by;
    this.order = order;
  }

  static createColumnSort(sort: PlexSort) {
    const desc = sort.order === 'desc';
    const id = Object.keys(plexSortKeyMap)
      .find((key) => plexSortKeyMap[key as keyof Track & 'random'] === sort.by)!;
    return { desc, id };
  }

  static parse(sort: string) {
    const [by, order] = sort.split(':') as [string, 'asc' | 'desc'];
    return new PlexSort(by, order);
  }

  static parseColumnSort(sort: ColumnSort) {
    const by = plexSortKeyMap[sort.id as keyof Track & 'random']!;
    const order = sort.desc ? 'desc' : 'asc';
    return new PlexSort(by, order);
  }

  setBy(newBy: string) {
    this.by = newBy;
    return new PlexSort(this.by, this.order);
  }

  setOrder(newOrder: 'asc' | 'desc') {
    this.order = newOrder;
    return new PlexSort(this.by, this.order);
  }

  reverseOrder() {
    if (this.order === 'asc') {
      this.order = 'desc';
      return new PlexSort(this.by, this.order);
    }
    this.order = 'asc';
    return new PlexSort(this.by, this.order);
  }

  stringify() {
    return [this.by, this.order].join(':');
  }
}

export function plexSort(by: string, order: 'asc' | 'desc') {
  return new PlexSort(by, order);
}

export default PlexSort;
