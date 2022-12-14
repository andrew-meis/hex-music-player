import {
  Box, Chip, Fade, IconButton, SvgIcon, TextField, Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import {
  BiHash,
  RiHeartLine,
  RiRefreshLine,
  RiTimeLine,
} from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import usePlayback from 'hooks/usePlayback';
import { iconButtonStyle } from '../../constants/style';
import { ChartsContext } from './Charts';
import FixedHeader from './FixedHeader';

const dayOptions = [7, 30, 90, 365];

const textFieldStyle = {
  position: 'relative',
  top: '3px',
  width: '10ch',
  '& .MuiFormHelperText-root': {
    whiteSpace: 'nowrap !important',
  },
};

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ChartsContext }) => {
  const {
    config, days, isFetching, setDays, endDate, setEndDate, startDate, setStartDate, theme,
  } = context!;
  const endInput = useRef<HTMLInputElement>();
  const startInput = useRef<HTMLInputElement>();
  const [end, setEnd] = useState(endDate);
  const [start, setStart] = useState(startDate);
  const [error, setError] = useState(false);
  const { playUri } = usePlayback();
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  useEffect(() => {
    setStart(startDate);
    setEnd(endDate);
  }, [endDate, startDate]);

  const uriParams = {
    type: 10,
    librarySectionID: config.sectionId,
    'viewedAt>': startDate.unix(),
    'viewedAt<': endDate.unix(),
    limit: 101,
    accountID: 1,
  };
  const uri = `/library/all/top?${new URLSearchParams(uriParams as any).toString()}`;
  const handlePlay = () => playUri(uri);
  const handleShuffle = () => playUri(uri, true);

  const handleSetDates = (event: React.FormEvent) => {
    event.preventDefault();
    startInput.current?.blur();
    endInput.current?.blur();
    const newStart = start.hour(0).minute(0).second(0);
    const newEnd = end.hour(23).minute(59).second(59);
    const diff = newEnd.diff(newStart, 'days');
    if (newStart.isBefore(newEnd)) {
      setStartDate(newStart);
      setEndDate(newEnd);
      if (dayOptions.includes(diff) && newEnd.isSame(moment(), 'day')) {
        setDays(diff);
      } else {
        setDays(0);
      }
      setError(false);
      return;
    }
    setError(true);
  };

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth="1600px"
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            color={theme.palette.primary.main}
            days={days}
            end={end}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            start={start}
          />
        </Box>
      </Fade>
      <Box
        maxWidth="900px"
        mx="auto"
        ref={ref}
        width="89%"
      >
        <Box
          alignItems="center"
          color="text.primary"
          display="flex"
          height={70}
        >
          <Typography sx={{ fontWeight: 600 }} variant="h4">Charts</Typography>
          <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
        </Box>
        <Box
          alignItems="center"
          display="flex"
          height={72}
        >
          <Box
            alignItems="center"
            display="flex"
            flexWrap="wrap"
            gap="8px"
          >
            {dayOptions.map((numberOfDays) => (
              <Chip
                color={days === numberOfDays ? 'primary' : 'default'}
                key={numberOfDays}
                label={`Last ${numberOfDays} days`}
                sx={{ fontSize: '0.9rem' }}
                onClick={() => setDays(numberOfDays)}
              />
            ))}
          </Box>
          <Box
            component="form"
            display="flex"
            ml="auto"
            onSubmit={handleSetDates}
          >
            <TextField
              error={error}
              helperText={error ? 'Must be before end date.' : ' '}
              inputRef={startInput}
              label="start"
              sx={textFieldStyle}
              type="date"
              value={start.toISOString(true).split('T')[0]}
              variant="standard"
              onChange={(e) => {
                const date = moment(e.target.value);
                if (!date.isValid()) {
                  return;
                }
                setStart(date);
              }}
            />
            <Typography color="text.primary" height={1} sx={{ position: 'relative', top: 23 }}>
              &nbsp;&nbsp;–&nbsp;&nbsp;
            </Typography>
            <TextField
              inputRef={endInput}
              label="end"
              sx={textFieldStyle}
              type="date"
              value={end.toISOString(true).split('T')[0]}
              variant="standard"
              onChange={(e) => {
                const date = moment(e.target.value);
                if (!date.isValid()) {
                  return;
                }
                setEnd(date);
              }}
            />
            {!isFetching && (
              <IconButton
                sx={{
                  ...iconButtonStyle,
                  alignSelf: 'center',
                  height: 32,
                  width: 32,
                }}
                type="submit"
              >
                <SvgIcon>
                  <RiRefreshLine />
                </SvgIcon>
              </IconButton>
            )}
            {isFetching && (
              <SvgIcon
                sx={{
                  alignSelf: 'center',
                  animation: 'spin 1.4s linear infinite',
                  color: 'text.secondary',
                  padding: '4px',
                }}
              >
                <RiRefreshLine />
              </SvgIcon>
            )}
          </Box>
        </Box>
        <Box
          alignItems="flex-start"
          borderBottom="1px solid"
          borderColor="border.main"
          color="text.secondary"
          display="flex"
          height={30}
          width="100%"
        >
          <Box maxWidth="10px" width="10px" />
          <Box display="flex" flexShrink={0} justifyContent="center" width="40px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <BiHash />
            </SvgIcon>
          </Box>
          <Box sx={{ width: '56px' }} />
          <Box
            sx={{
              alignItems: 'center',
              width: '50%',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          />
          <Box display="flex" flexShrink={0} justifyContent="flex-end" mx="5px" width="80px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiHeartLine />
            </SvgIcon>
          </Box>
          <Box sx={{
            width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
          }}
          >
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiTimeLine />
            </SvgIcon>
          </Box>
          <Box maxWidth="10px" width="10px" />
        </Box>
      </Box>
    </>
  );
};

export default Header;
