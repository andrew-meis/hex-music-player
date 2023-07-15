import { Box, Chip } from '@mui/material';
import React from 'react';
import { TableSettings } from 'components/track/column-headers';
import { WIDTH_CALC } from 'constants/measures';

const Subheader: React.FC<{
  count: number,
  openColumnDialog: () => void,
}> = ({
  count,
  openColumnDialog,
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
    <Chip color="primary" label={`${count} ${count === 1 ? 'track' : 'tracks'}`} />
    <Box display="flex">
      <TableSettings
        openColumnDialog={openColumnDialog}
      />
    </Box>
  </Box>
);

export default Subheader;
