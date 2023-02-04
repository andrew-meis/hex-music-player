import { Box, Typography } from '@mui/material';
import React from 'react';
import { WIDTH_CALC } from 'constants/measures';
import { RowProps } from './SimilarArtists';

const GroupRow = React.memo(({ index, context }: RowProps) => {
  const {
    items: { groups },
  } = context;
  const { text } = groups![index];

  return (
    <Box
      alignItems="flex-end"
      color="text.primary"
      display="flex"
      height={72}
      mx="auto"
      width={WIDTH_CALC}
    >
      <Typography fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
        {text}
      </Typography>
    </Box>
  );
});

export default GroupRow;
