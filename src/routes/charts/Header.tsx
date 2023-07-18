import {
  Box, Chip, Divider, Fade, IconButton, SvgIcon, TextField, Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { RiRefreshLine } from 'react-icons/ri';
import { useInView } from 'react-intersection-observer';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import TableSettings from 'components/track-table/TrackTableSettings';
import { WIDTH_CALC } from 'constants/measures';
import { iconButtonStyle } from 'constants/style';
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

const Header: React.FC<{
  days: number,
  endDate: moment.Moment,
  handlePlayNow: (key?: string, shuffle?: boolean) => Promise<void>
  isFetching: boolean,
  openColumnDialog: () => void,
  setDays: React.Dispatch<React.SetStateAction<number>>,
  setEndDate: React.Dispatch<React.SetStateAction<moment.Moment>>,
  setStartDate: React.Dispatch<React.SetStateAction<moment.Moment>>,
  startDate: moment.Moment,
}> = ({
  days,
  endDate,
  handlePlayNow,
  isFetching,
  openColumnDialog,
  setDays,
  setEndDate,
  setStartDate,
  startDate,
}) => {
  const endInput = useRef<HTMLInputElement>();
  const startInput = useRef<HTMLInputElement>();
  const [end, setEnd] = useState(endDate);
  const [start, setStart] = useState(startDate);
  const [error, setError] = useState(false);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  useEffect(() => {
    setStart(startDate);
    setEnd(endDate);
  }, [endDate, startDate]);

  const handlePlay = () => handlePlayNow();
  const handleShuffle = () => handlePlayNow(undefined, true);

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
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            days={days}
            end={end}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            start={start}
          />
        </Box>
      </Fade>
      <Box
        mx="auto"
        ref={ref}
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          color="text.primary"
          display="flex"
          height={70}
          paddingX="6px"
        >
          <Typography variant="h1">Charts</Typography>
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
          <Divider
            orientation="vertical"
            sx={{
              borderColor: 'var(--mui-palette-border-main)',
              height: 36,
              ml: '12px',
              mr: '14px',
            }}
          />
          <Box mt="2px">
            <TableSettings
              openColumnDialog={openColumnDialog}
            />
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Header;
