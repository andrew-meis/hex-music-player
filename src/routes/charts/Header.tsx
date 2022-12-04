import {
  Box, Chip, SvgIcon, TextField, Typography,
} from '@mui/material';
import React from 'react';
import DatePicker from 'react-datepicker';
import { BiHash, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { ChartsContext } from './Charts';

const dayOptions = [7, 30, 90, 365];

const DatePickerInput = React
  .forwardRef<HTMLInputElement>((props, ref) => {
    // @ts-ignore
    // eslint-disable-next-line react/prop-types
    const { label, value, onChange, onClick } = props;
    return (
      <TextField
        label={label}
        ref={ref}
        sx={{ position: 'relative', top: '-8px', width: '10ch' }}
        value={value}
        variant="standard"
        onChange={onChange}
        onClick={onClick}
      />
    );
  });

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ChartsContext }) => {
  const { days, setDays, endDate, setEndDate, startDate, setStartDate } = context!;

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
        height={44}
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
          <DatePicker
            scrollableYearDropdown
            showMonthDropdown
            showYearDropdown
            // @ts-ignore
            customInput={<DatePickerInput label="start" />}
            dropdownMode="select"
            maxDate={new Date(endDate) || new Date()}
            minDate={new Date(946702800000)}
            selected={new Date(startDate)}
            onChange={(date) => {
              setStartDate(date!.setHours(0, 0, 0, 0));
              setDays(0);
            }}
          />
          <DatePicker
            scrollableYearDropdown
            showMonthDropdown
            showYearDropdown
            // @ts-ignore
            customInput={<DatePickerInput label="end" />}
            dropdownMode="select"
            maxDate={new Date()}
            minDate={new Date(startDate)}
            selected={new Date(endDate)}
            onChange={(date) => {
              setEndDate(date!.setHours(23, 59, 59, 0));
              setDays(0);
            }}
          />
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
