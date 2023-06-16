import { AlbumWithSection } from 'types/interfaces';

export class HexSort {
  by: keyof AlbumWithSection;

  order: 'asc' | 'desc';

  constructor(by: keyof AlbumWithSection, order: 'asc' | 'desc') {
    this.by = by;
    this.order = order;
  }

  static parse(sort: string) {
    const [by, order] = sort.split(':') as [keyof AlbumWithSection, 'asc' | 'desc'];
    return new HexSort(by, order);
  }

  setBy(newBy: keyof AlbumWithSection) {
    this.by = newBy;
    return new HexSort(this.by, this.order);
  }

  setOrder(newOrder: 'asc' | 'desc') {
    this.order = newOrder;
    return new HexSort(this.by, this.order);
  }

  reverseOrder() {
    if (this.order === 'asc') {
      this.order = 'desc';
      return new HexSort(this.by, this.order);
    }
    this.order = 'asc';
    return new HexSort(this.by, this.order);
  }

  stringify() {
    return [this.by, this.order].join(':');
  }
}

export function hexSort(by: keyof AlbumWithSection, order: 'asc' | 'desc') {
  return new HexSort(by, order);
}

export default HexSort;
