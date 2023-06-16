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
