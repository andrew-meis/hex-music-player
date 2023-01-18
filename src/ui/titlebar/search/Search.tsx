import {
  Box,
  ClickAwayListener,
  Fade,
  IconButton,
  InputBase,
  Paper,
  PaperProps,
  Portal,
  SvgIcon,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useRef, useState } from 'react';
import {
  IoIosArrowBack,
  IoIosArrowForward,
  CgSearch,
  MdClear,
  RiRefreshLine,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { useSearch } from 'queries/plex-queries';
import { QueryKeys } from 'types/enums';
import { Result } from 'types/types';
import SearchResultBox from './SearchResultBox';

const Search = ({ searchContainer } : {searchContainer: React.RefObject<HTMLDivElement>}) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchInput = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState('history');
  const [input, setInput] = useState('');
  const [inputDebounced, setInputDebounced] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const onSuccess = (data: Result[]) => {
    setSearchHistory((prev) => [input, ...prev]);
    if (data.length === 0) {
      setDisplay('no-results');
      setLoading(false);
      return;
    }
    setDisplay('results');
    setLoading(false);
  };
  const searchResults = useSearch({ query: inputDebounced, onSuccess });

  useDebounce(() => {
    setInputDebounced(input);
  }, 500, [input]);

  useEffect(() => {
    if (input.length <= 1) {
      setDisplay('history');
      setLoading(false);
      queryClient.setQueriesData([QueryKeys.SEARCH], []);
      return;
    }
    setLoading(true);
  }, [input, queryClient]);

  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    event.target.select();
    setOpen(true);
  };

  const handleClear = () => {
    setDisplay('history');
    queryClient.setQueriesData([QueryKeys.SEARCH], []);
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
    <Box
      alignItems="center"
      display="flex"
      margin="auto"
      sx={{ WebkitAppRegion: 'no-drag' }}
    >
      <IconButton
        disableRipple
        size="small"
        sx={{
          color: 'text.secondary',
          transition: '0.2s',
          '&:hover': {
            color: 'primary.main',
            transform: 'scale(1.2)',
            cursor: 'pointer',
          },
        }}
        title="Back"
        onClick={() => navigate(-1)}
      >
        <SvgIcon>
          <IoIosArrowBack />
        </SvgIcon>
      </IconButton>
      <ClickAwayListener mouseEvent="onMouseDown" onClickAway={handleClickAway}>
        <Box
          height={40}
          maxWidth={502}
          sx={{
            willChange: 'transform',
          }}
          width="calc(40vw + 2px)"
        >
          <Paper
            component="form"
            elevation={3}
            sx={{
              alignItems: 'center',
              borderRadius: '12px',
              boxShadow: 'none',
              display: 'flex',
              width: '100%',
            }}
          >
            <IconButton
              disableRipple
              sx={{
                m: '2px',
                p: '5px',
                pr: '7px',
                pl: '3px',
                color: 'text.secondary',
                '&:hover': {
                  backgroundColor: 'transparent',
                  color: 'text.primary',
                },
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
            {input.length !== 0 && !loading && (
              <IconButton
                disableRipple
                sx={{
                  m: '2px',
                  p: '5px',
                  color: 'text.secondary',
                  '&:hover': {
                    backgroundColor: 'transparent',
                    color: 'text.primary',
                  },
                }}
                onClick={handleClear}
              >
                <SvgIcon><MdClear /></SvgIcon>
              </IconButton>
            )}
            {loading && (
              <SvgIcon
                sx={{
                  alignSelf: 'center',
                  animation: 'spin 1.4s linear infinite',
                  color: 'text.secondary',
                  padding: '7px',
                }}
              >
                <RiRefreshLine />
              </SvgIcon>
            )}
          </Paper>
          <Portal container={searchContainer.current}>
            <Fade in={open} style={{ transformOrigin: 'top' }} timeout={300}>
              <Box
                bgcolor="transparent"
                border="1px solid"
                borderColor="border.main"
                borderRadius="12px"
                boxShadow={`
                  0px 5px 5px -3px rgb(0 0 0 / 20%),
                  0px 8px 10px 1px rgb(0 0 0 / 14%),
                  0px 3px 14px 2px rgb(0 0 0 / 12%)
                `}
                display="table"
                id="search-container"
                left={0}
                margin="auto"
                maxWidth="502px"
                position="absolute"
                right={0}
                sx={{
                  contain: 'paint',
                  transform: 'scale(1,1) !important',
                }}
                top={4}
                width="calc(40vw + 2px)"
                zIndex={1300}
              >
                <Box
                  boxShadow="none !important"
                  component={(props: PaperProps) => (<Paper elevation={3} {...props} />)}
                >
                  <Box
                    borderBottom="1px solid"
                    borderColor="border.main"
                    boxShadow="none !important"
                    component={(props: PaperProps) => (<Paper elevation={3} {...props} />)}
                    height={38}
                    marginX="auto"
                    width="95%"
                  />
                  <SearchResultBox
                    display={display}
                    searchHistory={searchHistory}
                    searchResults={searchResults}
                    setInput={setInput}
                    setOpen={setOpen}
                    setSearchHistory={setSearchHistory}
                  />
                </Box>
              </Box>
            </Fade>
          </Portal>
        </Box>
      </ClickAwayListener>
      <IconButton
        disableRipple
        size="small"
        sx={{
          color: 'text.secondary',
          transition: '0.2s',
          '&:hover': {
            color: 'primary.main',
            transform: 'scale(1.2)',
            cursor: 'pointer',
          },
        }}
        title="Forward"
        onClick={() => navigate(1)}
      >
        <SvgIcon>
          <IoIosArrowForward />
        </SvgIcon>
      </IconButton>
    </Box>
  );
};

export default Search;
