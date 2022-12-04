import { Grid, Paper, Typography } from '@mui/material';
import React from 'react';
import { useWindowSize } from 'react-use';
import Results from './results/Results';
import TopResult from './results/TopResult';
import quotes from './search_quotes.json';
import type { Album, Artist, Track } from 'hex-plex';
import type { Result } from 'types/types';

interface Props {
  query: string;
  results: Result[] | undefined;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const isEmpty = (xs: string | any[]) => xs.length === 0;

const head = (xs: any[]) => xs[0];

const tail = (xs: string | any[]) => xs.slice(1);

// eslint-disable-next-line symbol-description
const None = Symbol();

// @ts-ignore
const roundRobin = ([a = None, ...rest]): Result[] =>
  // base: no `a`
  // eslint-disable-next-line implicit-arrow-linebreak,no-nested-ternary
  (a === None
    ? []
  // inductive: some `a`
    : isEmpty(a)
      ? roundRobin(rest)
    // inductive: some non-empty `a`
      : [head(a), ...roundRobin([...rest, tail(a)])]);

const SearchResultBox = ({ query, results = [], setOpen }: Props) => {
  const [topResult, ...rest] = results;
  const resultsData = [
    rest.filter((result): result is Artist => result.type === 'artist'),
    rest.filter((result): result is Album => result.type === 'album'),
    rest.filter((result): result is Track => result.type === 'track'),
  ];
  const sectionCount = resultsData.filter((array) => array.length >= 1).length;
  const { height } = useWindowSize();
  const listHeight = height - 152 - 174 - (sectionCount * 24);

  const sectionHeight = () => {
    const listItemsCount = listHeight / 56;
    if (listItemsCount % 1 > 0.001) {
      return Math.floor(listItemsCount);
    }
    if (listItemsCount % 1 < 0.001) {
      return Math.floor(listItemsCount - 1);
    }
    return Math.floor(listItemsCount - 1);
  };

  // @ts-ignore
  const sortedData = roundRobin(resultsData).slice(0, sectionHeight());

  if (results.length === 0 || query.length <= 1) {
    return (
      <Grid
        container
        alignContent="center"
        boxShadow="none !important"
        component={Paper}
        height="100px"
        justifyContent="center"
        padding="4px"
        sx={{ color: 'text.primary' }}
        width="auto"
      >
        <Typography sx={{ textAlign: 'center' }} width={1}>
          {quotes[0].original}
        </Typography>
        <Typography sx={{ textAlign: 'center' }} width={1}>
          {quotes[0].english}
        </Typography>
      </Grid>
    );
  }

  return (
    <Grid
      container
      color="text.primary"
      height="fit-content"
      maxHeight={`calc(${height}px - 146px)`}
      padding="4px"
      width="auto"
    >
      <Grid item xs={12}>
        <TopResult setOpen={setOpen} topResult={topResult} />
      </Grid>
      <Grid item xs={12}>
        <Results
          options={{ showLabel: true, showNumber: false }}
          results={sortedData.filter((result) => result.type === 'artist')}
          setOpen={setOpen}
          type="artist"
        />
      </Grid>
      <Grid item xs={12}>
        <Results
          options={{ showLabel: true, showNumber: false }}
          results={sortedData.filter((result) => result.type === 'album')}
          setOpen={setOpen}
          type="album"
        />
      </Grid>
      <Grid item xs={12}>
        <Results
          options={{ showLabel: true, showNumber: false }}
          results={sortedData.filter((result) => result.type === 'track')}
          setOpen={setOpen}
          type="track"
        />
      </Grid>
    </Grid>
  );
};

export default SearchResultBox;
