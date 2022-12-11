import {
  Box, Chip, IconButton, SvgIcon, TextField, Typography,
} from '@mui/material';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import {
  BiHash,
  BsCheckCircle,
  RiHeartLine,
  RiTimeLine,
} from 'react-icons/all';
import { iconButtonStyle } from '../../constants/style';
import { ChartsContext } from './Charts';

const dayOptions = [7, 30, 90, 365];

const textFieldStyle = {
  position: 'relative',
  top: '0px',
  width: '10ch',
  '& .MuiFormHelperText-root': {
    whiteSpace: 'nowrap !important',
  },
};

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ChartsContext }) => {
  const { days, setDays, endDate, setEndDate, startDate, setStartDate } = context!;
  const [end, setEnd] = useState(endDate);
  const [start, setStart] = useState(startDate);
  const [error, setError] = useState(false);

  useEffect(() => {
    setStart(startDate);
    setEnd(endDate);
  }, [endDate, startDate]);

  const handleSetDates = () => {
    if (start.hour(0).minute(0).second(0).isBefore(end.hour(23).minute(59).second(59))) {
      setStartDate(start.hour(0).minute(0).second(0));
      setEndDate(end.hour(23).minute(59).second(59));
      setDays(0);
      setError(false);
      return;
    }
    setError(true);
  };

  return (
    <Box
      maxWidth="900px"
      mx="auto"
      width="89%"
    >
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        height={70}
      >
        <Typography sx={{ fontWeight: 600 }} variant="h4">Charts</Typography>
      </Box>
      <Box
        alignItems="center"
        display="flex"
        height={72}
      >
        {dayOptions.map((numberOfDays) => (
          <Chip
            color={days === numberOfDays ? 'primary' : 'default'}
            key={numberOfDays}
            label={`Last ${numberOfDays} days`}
            sx={{ fontSize: '0.9rem', mr: '8px' }}
            onClick={() => setDays(numberOfDays)}
          />
        ))}
        <Box
          display="flex"
          ml="auto"
        >
          <TextField
            error={error}
            helperText={error ? 'Must be before end date.' : ' '}
            label="start"
            sx={textFieldStyle}
            type="date"
            value={start.toISOString().split('T')[0]}
            variant="standard"
            onChange={(e) => {
              const date = moment(e.target.value).utc();
              if (!date.isValid()) {
                return;
              }
              setStart(date);
            }}
          />
          <span style={{ width: '8px' }} />
          <TextField
            label="end"
            sx={textFieldStyle}
            type="date"
            value={end.toISOString().split('T')[0]}
            variant="standard"
            onChange={(e) => {
              const date = moment(e.target.value).utc();
              if (!date.isValid()) {
                return;
              }
              setEnd(date);
            }}
          />
          <IconButton
            sx={iconButtonStyle}
            onClick={handleSetDates}
          >
            <SvgIcon>
              <BsCheckCircle />
            </SvgIcon>
          </IconButton>
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
  );
};

export default Header;
