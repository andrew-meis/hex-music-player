import {
  Box,
  CircularProgress,
  ClickAwayListener,
  Fade,
  IconButton,
  InputBase,
  Paper,
  Portal,
  SvgIcon,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import { CgSearch, MdClear } from 'react-icons/all';
import { useDebounce } from 'react-use';
import { useSearch } from '../../../hooks/queryHooks';
import SearchResultBox from './SearchResultBox';

const Search = ({ searchContainer }: {searchContainer: React.RefObject<HTMLDivElement>}) => {
  const queryClient = useQueryClient();
  const searchInput = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState('');
  const [inputDebounced, setInputDebounced] = useState('');
  const [inputHover, setInputHover] = useState(false);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const { data: searchResults } = useSearch({ query: inputDebounced });

  useDebounce(() => {
    setInputDebounced(input);
    setLoading(false);
  }, 500, [input]);

  useEffect(() => {
    if (input.length === 0) {
      queryClient.setQueriesData(['search'], []);
      return;
    }
    setLoading(true);
  }, [input, queryClient]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    setOpen(true);
  };

  const handleClear = () => {
    queryClient.setQueriesData(['search'], []);
    setInput('');
    searchInput.current?.focus();
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput(event.target.value);
  };

  const handleClickAway = () => {
    setOpen(false);
  };

  return (
    <ClickAwayListener mouseEvent="onMouseDown" onClickAway={handleClickAway}>
      <Box
        height={40}
        maxWidth={502}
        mx="auto"
        sx={{
          willChange: 'transform',
        }}
        width="calc(40vw + 2px)"
      >
        <Paper
          component="form"
          sx={{
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            boxShadow: 'none',
            WebkitAppRegion: 'no-drag',
          }}
          onMouseEnter={() => setInputHover(true)}
          onMouseLeave={() => setInputHover(false)}
        >
          <IconButton
            sx={{
              m: '2px', ml: '8px', p: '5px', pr: '7px', pl: '3px', color: 'text.primary',
            }}
            onClick={() => searchInput.current?.focus()}
          >
            <SvgIcon><CgSearch /></SvgIcon>
          </IconButton>
          <InputBase
            fullWidth
            autoComplete="off"
            inputProps={{ maxLength: 35, spellCheck: false }}
            inputRef={searchInput}
            placeholder="Search"
            value={input}
            onBlur={() => null}
            onChange={handleChange}
            onFocus={handleFocus}
          />
          {inputHover && input.length !== 0 && !loading && (
            <IconButton
              sx={{ m: '2px', p: '5px', color: 'text.primary' }}
              onClick={handleClear}
            >
              <SvgIcon><MdClear /></SvgIcon>
            </IconButton>
          )}
          {loading && (
            <CircularProgress
              size={24}
              sx={{
                my: 'auto', color: 'text.primary', position: 'absolute', right: '8px',
              }}
            />
          )}
        </Paper>
        <Portal container={searchContainer.current}>
          <Fade in={open} style={{ transformOrigin: 'top' }} timeout={300}>
            <Box
              bgcolor="transparent"
              border="1px solid"
              borderColor="primary.main"
              borderRadius="4px"
              display="table"
              id="search-container"
              left={0}
              margin="auto"
              maxWidth="502px"
              position="absolute"
              right={0}
              sx={{
                transform: 'scale(1,1) !important',
              }}
              top={4}
              width="calc(40vw + 2px)"
              zIndex={1300}
            >
              <Box
                boxShadow="none !important"
                component={Paper}
              >
                <Box
                  borderBottom="1px solid"
                  borderColor="border.main"
                  boxShadow="none !important"
                  component={Paper}
                  height={38}
                  marginX="auto"
                  width="95%"
                />
                <SearchResultBox query={inputDebounced} results={searchResults} setOpen={setOpen} />
              </Box>
            </Box>
          </Fade>
        </Portal>
      </Box>
    </ClickAwayListener>
  );
};

export default Search;
