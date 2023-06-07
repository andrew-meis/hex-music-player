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
import { useQuery, useQueryClient } from '@tanstack/react-query';
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
import useHistoryStack from 'hooks/useHistoryStack';
import { useLibrary } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';
import { Result } from 'types/types';
import SearchResultBox from './SearchResultBox';

const Search = ({ searchContainer } : {searchContainer: React.RefObject<HTMLDivElement>}) => {
  const library = useLibrary();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const searchInput = useRef<HTMLInputElement>(null);
  const [display, setDisplay] = useState('history');
  const [input, setInput] = useState('');
  const [inputDebounced, setInputDebounced] = useState('');
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const { backward, forward } = useHistoryStack();
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
  const searchResults = useQuery(
    [QueryKeys.SEARCH, inputDebounced],
    () => library.searchAll(inputDebounced, 10),
    {
      enabled: inputDebounced.length > 1,
      keepPreviousData: true,
      onSuccess,
      refetchOnWindowFocus: false,
      select: (data) => {
        if (!data.hubs) return [];
        return data.hubs.map((hub) => hub.items).flat() as Result[];
      },
    },
  );

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

  const handleBlur = () => {
    const selection = document.getSelection();
    if (selection) {
      selection.empty();
    }
  };

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
        disabled={!backward}
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
            onSubmit={(e) => {
              e.preventDefault();
              setOpen(false);
              setSearchHistory((prev) => [input, ...prev]);
              handleClear();
              navigate(`/search?query=${input}`);
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
              onBlur={handleBlur}
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
                boxShadow={8}
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
                    input={input}
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
        disabled={!forward}
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
