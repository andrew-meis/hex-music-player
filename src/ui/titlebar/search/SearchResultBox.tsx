import { Box, Grid, Paper, SvgIcon, Typography } from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { uniq } from 'lodash';
import React from 'react';
import { IoCloseSharp } from 'react-icons/all';
import { useWindowSize } from 'react-use';
import Results from './results/Results';
import TopResult from './results/TopResult';
import quotes from './search_quotes.json';
import type { Album, Artist, Track } from 'hex-plex';
import type { Result } from 'types/types';

interface Props {
  display: string;
  searchHistory: string[];
  searchResults: UseQueryResult<Result[], unknown>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
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
    // @ts-ignore
      : [head(a), ...roundRobin([...rest, tail(a)])]);

const SearchResultBox = ({
  display, searchHistory, searchResults, setInput, setOpen, setSearchHistory,
}: Props) => {
  const { height } = useWindowSize();
  let topResult;
  let rest;
  let sortedData;
  if (searchResults.data && searchResults.data.length > 0) {
    [topResult, ...rest] = searchResults.data;
    const resultsData = [
      rest.filter((result): result is Artist => result.type === 'artist'),
      rest.filter((result): result is Album => result.type === 'album'),
      rest.filter((result): result is Track => result.type === 'track'),
    ];
    const sectionCount = resultsData.filter((array) => array.length >= 1).length;
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
    sortedData = roundRobin(resultsData).slice(0, sectionHeight());
  }

  if (display === 'history') {
    return (
      <Grid
        container
        boxShadow="none !important"
        component={(props) => (<Paper elevation={3} {...props} />)}
        display="flex"
        flexDirection="column"
        height="fit-content"
        justifyContent="center"
        maxHeight={`calc(${height}px - 146px)`}
        padding={searchHistory.length === 0 ? '0px' : '4px'}
        sx={{ color: 'text.primary' }}
        width="auto"
      >
        {searchHistory.length === 0 && (
          <Box
            alignItems="center"
            color="text.secondary"
            display="flex"
            height={24}
            justifyContent="center"
            padding="4px"
          >
            ...no recent searches...
          </Box>
        )}
        {uniq(searchHistory).slice(0, 10).map((entry) => (
          <Box
            alignItems="center"
            borderRadius="4px"
            className="box"
            color="text.secondary"
            display="flex"
            height={24}
            key={entry}
            padding="4px 8px 4px 12px"
            sx={{
              '&:hover': {
                backgroundColor: 'action.selected',
                color: 'text.primary',
              },
            }}
            onClick={() => setInput(entry)}
          >
            {entry}
            <SvgIcon
              sx={{
                color: 'text.secondary',
                marginLeft: 'auto',
                '&:hover': {
                  color: 'text.primary',
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                setSearchHistory((prev) => prev.filter((val) => val !== entry));
              }}
            >
              <IoCloseSharp />
            </SvgIcon>
          </Box>
        ))}
      </Grid>
    );
  }

  if (display === 'no-results' || !topResult || !sortedData) {
    return (
      <Grid
        container
        alignContent="center"
        boxShadow="none !important"
        component={(props) => (<Paper elevation={3} {...props} />)}
        height={120}
        justifyContent="center"
        padding="4px"
        sx={{ color: 'text.primary' }}
        width="auto"
      >
        <Typography textAlign="center" width={1}>
          {quotes[0].original}
        </Typography>
        <Typography textAlign="center" width={1}>
          {quotes[0].english}
        </Typography>
        <Typography color="text.secondary" mt="6px" textAlign="center" width={1}>
          (...no results...)
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
