import { ColumnSort } from '@tanstack/react-table';
import { Album, Artist, Track } from 'api/index';

const sortKeyMap: Partial<Record<keyof (Artist | Album | Track) | 'random', string>> = {
  addedAt: 'addedAt',
  lastViewedAt: 'lastViewedAt',
  random: 'random',
  title: 'titleSort',
  viewCount: 'viewCount',
};

const albumSortKeyMap: Partial<Record<keyof Album | 'random', string>> = {
  ...sortKeyMap,
  originallyAvailableAt: 'originallyAvailableAt',
  parentTitle: 'artist.titleSort',
  year: 'year',
};

const artistSortKeyMap: Partial<Record<keyof Artist | 'random', string>> = {
  ...sortKeyMap,
};

const trackSortKeyMap: Partial<Record<keyof Track | 'random', string>> = {
  ...sortKeyMap,
  duration: 'duration',
  grandparentTitle: 'artist.titleSort',
  lastRatedAt: 'lastRatedAt',
  originalTitle: 'originalTitle',
  parentTitle: 'album.titleSort',
  parentYear: 'album.year',
  ratingCount: 'ratingCount',
  userRating: 'userRating',
};

export class PlexSort {
  by: string;

  order: 'asc' | 'desc';

  constructor(by: string, order: 'asc' | 'desc') {
    this.by = by;
    this.order = order;
  }

  static parse(sort: string) {
    const [by, order] = sort.split(':') as [string, 'asc' | 'desc'];
    return new PlexSort(by, order);
  }

  static parseColumnSort(sort: ColumnSort, type: 'album' | 'artist' | 'track') {
    let by;
    if (type === 'album') {
      by = albumSortKeyMap[sort.id as keyof Album | 'random']!;
    }
    if (type === 'artist') {
      by = artistSortKeyMap[sort.id as keyof Artist | 'random']!;
    }
    if (type === 'track') {
      by = trackSortKeyMap[sort.id as keyof Track | 'random']!;
    }
    const order = sort.desc ? 'desc' : 'asc';
    return new PlexSort(by!, order);
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
