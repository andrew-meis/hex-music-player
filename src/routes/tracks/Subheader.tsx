import { Box, Chip } from '@mui/material';
import React from 'react';
import { ChipFilter } from 'components/chips';
import { WIDTH_CALC } from 'constants/measures';

const Subheader: React.FC<{
  count: number,
  filter: string,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
}> = ({
  count,
  filter,
  setFilter,
}) => (
  <Box
    alignItems="center"
    display="flex"
    height={72}
    justifyContent="space-between"
    mt={1}
    mx="auto"
    width={WIDTH_CALC}
  >
    <ChipFilter
      filter={filter}
      setFilter={setFilter}
    />
    <Chip
      color="primary"
      label={`${count} ${count === 1 ? 'track' : 'tracks'}`}
      sx={{
        fontSize: '0.9rem',
      }}
    />
  </Box>
);

export default Subheader;
