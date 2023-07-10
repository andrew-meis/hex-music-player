export enum Operators {
  CONTAINS = 'contains',
  DOES_NOT_CONTAIN = 'does not contain',
  IS = 'is',
  IS_NOT = 'is not',
  BEGINS_WITH = 'begins with',
  ENDS_WITH = 'ends with',
  IS_BEFORE = 'is before',
  IS_AFTER = 'is after',
  IS_GREATER_THAN = 'is greater than',
  IS_LESS_THAN = 'is less than',
  IS_IN_THE_LAST = 'is in the last',
  IS_NOT_IN_THE_LAST = 'is not in the last'
}

export enum FilterTypes {
  TAG = 'tag',
  INT = 'int',
  STR = 'str',
  BOOL = 'bool',
  DATETIME = 'datetime',
}

export interface FilterSchema {
  groups: ('Artist' | 'Album' | 'Track')[];
  field: string;
  label: string;
  operators: Operators[];
  options?: any[];
  type: FilterTypes;
}

const filterSchemas: FilterSchema[] = [
  // metadata fields
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'title',
    label: 'Title',
    operators: [
      Operators.CONTAINS,
      Operators.DOES_NOT_CONTAIN,
      Operators.IS,
      Operators.IS_NOT,
      Operators.BEGINS_WITH,
      Operators.ENDS_WITH],
    type: FilterTypes.STR,
  },
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'userRating',
    label: 'Rating',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
      Operators.IS_GREATER_THAN,
      Operators.IS_LESS_THAN,
    ],
    options: [-1, 2, 4, 6, 8, 10],
    type: FilterTypes.INT,
  },
  {
    groups: ['Artist'],
    field: 'country',
    label: 'Country',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  {
    groups: ['Album'],
    field: 'studio',
    label: 'Record Label',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  // genre etc.
  {
    groups: ['Artist', 'Album'],
    field: 'genre',
    label: 'Genre',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  {
    groups: ['Artist', 'Album'],
    field: 'style',
    label: 'Style',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'mood',
    label: 'Mood',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  // metadata date fields
  {
    groups: ['Album'],
    field: 'decade',
    label: 'Decade',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
    ],
    options: [],
    type: FilterTypes.INT,
  },
  {
    groups: ['Album'],
    field: 'year',
    label: 'Year',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
    ],
    options: [],
    type: FilterTypes.INT,
  },
  {
    groups: ['Album'],
    field: 'originallyAvailableAt',
    label: 'Release Date',
    operators: [
      Operators.IS,
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
      Operators.IS_IN_THE_LAST,
      Operators.IS_NOT_IN_THE_LAST,
    ],
    type: FilterTypes.DATETIME,
  },
  // count fields
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'viewCount',
    label: 'Playcount',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
      Operators.IS_GREATER_THAN,
      Operators.IS_LESS_THAN,
    ],
    type: FilterTypes.INT,
  },
  {
    groups: ['Track'],
    field: 'skipCount',
    label: 'Skipcount',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
      Operators.IS_GREATER_THAN,
      Operators.IS_LESS_THAN,
    ],
    type: FilterTypes.INT,
  },
  // album formats
  {
    groups: ['Album'],
    field: 'format',
    label: 'Format',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  {
    groups: ['Album'],
    field: 'subformat',
    label: 'Type',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  // library dates
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'addedAt',
    label: 'Date Added',
    operators: [
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
      Operators.IS_IN_THE_LAST,
      Operators.IS_NOT_IN_THE_LAST,
    ],
    type: FilterTypes.DATETIME,
  },
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'lastViewedAt',
    label: 'Last Played',
    operators: [
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
      Operators.IS_IN_THE_LAST,
      Operators.IS_NOT_IN_THE_LAST,
    ],
    type: FilterTypes.DATETIME,
  },
  {
    groups: ['Track'],
    field: 'lastRatedAt',
    label: 'Last Rated',
    operators: [
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
      Operators.IS_IN_THE_LAST,
      Operators.IS_NOT_IN_THE_LAST,
    ],
    type: FilterTypes.DATETIME,
  },
  {
    groups: ['Track'],
    field: 'lastSkippedAt',
    label: 'Last Skipped',
    operators: [
      Operators.IS_BEFORE,
      Operators.IS_AFTER,
      Operators.IS_IN_THE_LAST,
      Operators.IS_NOT_IN_THE_LAST,
    ],
    type: FilterTypes.DATETIME,
  },
  // user organization
  {
    groups: ['Artist', 'Album'],
    field: 'collection',
    label: 'Collection',
    operators: [
      Operators.IS,
      Operators.IS_NOT,
    ],
    options: [],
    type: FilterTypes.TAG,
  },
  {
    groups: ['Artist', 'Album'],
    field: 'unmatched',
    label: 'Unmatched',
    operators: [
      Operators.IS,
    ],
    options: [true, false],
    type: FilterTypes.BOOL,
  },
];

export default filterSchemas;
