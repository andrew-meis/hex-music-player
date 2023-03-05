export interface FilterInput {
  groups: ('Artist' | 'Album' | 'Track')[];
  field: string;
  label: string;
  operators: ('contains' | 'does not contain' | 'is' | 'is not'
  | 'begins with' | 'ends with' | 'is before' | 'is after'
  | 'is greater than' | 'is less than' | 'is in the last' | 'is not in the last')[];
  options?: any[];
  type: 'tag' | 'int' | 'str' | 'bool' | 'datetime';
}

const filterInputs: FilterInput[] = [
  // metadata fields
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'title',
    label: 'Title',
    operators: ['contains', 'does not contain', 'is', 'is not', 'begins with', 'ends with'],
    type: 'str',
  },
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'userRating',
    label: 'Rating',
    operators: ['is', 'is not', 'is greater than', 'is less than'],
    options: [-1, 2, 4, 6, 8, 10],
    type: 'int',
  },
  {
    groups: ['Artist'],
    field: 'country',
    label: 'Country',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  {
    groups: ['Album'],
    field: 'studio',
    label: 'Record Label',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  // genre etc.
  {
    groups: ['Artist', 'Album'],
    field: 'genre',
    label: 'Genre',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  {
    groups: ['Artist', 'Album'],
    field: 'style',
    label: 'Style',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'mood',
    label: 'Mood',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  // metadata date fields
  {
    groups: ['Album'],
    field: 'decade',
    label: 'Decade',
    operators: ['is', 'is not', 'is before', 'is after'],
    options: [],
    type: 'int',
  },
  {
    groups: ['Album'],
    field: 'year',
    label: 'Year',
    operators: ['is', 'is not', 'is before', 'is after'],
    options: [],
    type: 'int',
  },
  {
    groups: ['Album'],
    field: 'originallyAvailableAt',
    label: 'Release Date',
    operators: ['is', 'is before', 'is after', 'is in the last', 'is not in the last'],
    type: 'datetime',
  },
  // count fields
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'viewCount',
    label: 'Playcount',
    operators: ['is', 'is not', 'is greater than', 'is less than'],
    type: 'int',
  },
  {
    groups: ['Track'],
    field: 'skipCount',
    label: 'Skipcount',
    operators: ['is', 'is not', 'is greater than', 'is less than'],
    type: 'int',
  },
  // album formats
  {
    groups: ['Album'],
    field: 'format',
    label: 'Format',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  {
    groups: ['Album'],
    field: 'subformat',
    label: 'Type',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  // library dates
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'addedAt',
    label: 'Date Added',
    operators: ['is before', 'is after', 'is in the last', 'is not in the last'],
    type: 'datetime',
  },
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'lastViewedAt',
    label: 'Last Played',
    operators: ['is before', 'is after', 'is in the last', 'is not in the last'],
    type: 'datetime',
  },
  {
    groups: ['Track'],
    field: 'lastRatedAt',
    label: 'Last Rated',
    operators: ['is before', 'is after', 'is in the last', 'is not in the last'],
    type: 'datetime',
  },
  {
    groups: ['Track'],
    field: 'lastSkippedAt',
    label: 'Last Skipped',
    operators: ['is before', 'is after', 'is in the last', 'is not in the last'],
    type: 'datetime',
  },
  // user organization
  {
    groups: ['Artist', 'Album', 'Track'],
    field: 'collection',
    label: 'Collection',
    operators: ['is', 'is not'],
    options: [],
    type: 'tag',
  },
  {
    groups: ['Artist', 'Album'],
    field: 'unmatched',
    label: 'Unmatched',
    operators: ['is'],
    options: [true, false],
    type: 'bool',
  },
];

export default filterInputs;
