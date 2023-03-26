import { Box, Grid, List, Paper, SvgIcon, Typography } from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { uniq } from 'lodash';
import React, { useMemo } from 'react';
import { IoCloseSharp } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { useWindowSize } from 'react-use';
import { isGenre } from 'types/type-guards';
import { Result } from 'types/types';
import ResultRow from './ResultRow';
import quotes from './search_quotes.json';

interface Props {
  display: string;
  input: string;
  searchHistory: string[];
  searchResults: UseQueryResult<Result[], unknown>;
  setInput: React.Dispatch<React.SetStateAction<string>>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setSearchHistory: React.Dispatch<React.SetStateAction<string[]>>;
}

const SearchResultBox = ({
  display, input, searchHistory, searchResults, setInput, setOpen, setSearchHistory,
}: Props) => {
  const { height } = useWindowSize();
  const results = useMemo(() => {
    if (!searchResults.data || searchResults.data.length === 0) return [];
    const { data } = searchResults;
    const listHeight = height - 152 - 32;
    const sectionHeight = () => {
      const listItemsCount = listHeight / 64;
      if (listItemsCount % 1 > 0.001) {
        return Math.floor(listItemsCount);
      }
      if (listItemsCount % 1 < 0.001) {
        return Math.floor(listItemsCount - 1);
      }
      return Math.floor(listItemsCount - 1);
    };
    // @ts-ignore
    return data
      .sort((a, b) => b.score - a.score
        || (!isGenre(b) ? b.viewCount || 0 : 0) - (!isGenre(a) ? a.viewCount || 0 : 0))
      .slice(0, sectionHeight());
  }, [height, searchResults]);

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

  if (display === 'no-results' || !results || results.length === 0) {
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
    <Box
      color="text.primary"
      height="fit-content"
      maxHeight={`calc(${height}px - 146px)`}
      padding="4px"
      width="auto"
    >
      <Box
        sx={{
          borderRadius: '4px',
          display: 'block',
        }}
        width="auto"
      >
        <List disablePadding>
          {results.map((result) => (
            <ResultRow
              key={result.id}
              result={result}
              setOpen={setOpen}
            />
          ))}
        </List>
      </Box>
      <Box
        alignItems="center"
        color="text.secondary"
        display="flex"
        height={24}
        justifyContent="center"
        padding="4px"
        width={1}
      >
        <Link
          className="link"
          to={`/search?query=${input}`}
          onClick={() => setOpen(false)}
        >
          View all results
        </Link>
      </Box>
    </Box>
  );
};

export default SearchResultBox;
