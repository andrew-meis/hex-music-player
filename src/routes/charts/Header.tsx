import {
  Box, FormControl, MenuItem, Select, SelectChangeEvent, SvgIcon, Typography,
} from '@mui/material';
import React from 'react';
import { BiHash, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { ChartsContext } from './Charts';

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ChartsContext }) => {
  const { days, setDays } = context!;
  const handleChange = (event: SelectChangeEvent) => {
    setDays(event.target.value);
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
        >
          <Typography>
            Chart time period:
          </Typography>
          <FormControl size="small" sx={{ ml: 1, minWidth: 120 }} variant="standard">
            <Select
              disableUnderline
              inputProps={{ sx: { borderRadius: '4px !important', padding: '3px 6px' } }}
              value={days}
              onChange={handleChange}
            >
              <MenuItem value="14">14 days</MenuItem>
              <MenuItem value="30">30 days</MenuItem>
              <MenuItem value="90">90 days</MenuItem>
              <MenuItem value="365">365 days</MenuItem>
            </Select>
          </FormControl>
        </Box>
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
