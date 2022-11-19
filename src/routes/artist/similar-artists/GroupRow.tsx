import { Box, Typography } from '@mui/material';
import React from 'react';
import { RowProps } from './SimilarArtists';

const GroupRow = React.memo(({ index, context }: RowProps) => {
  const {
    items: { groups },
  } = context;
  const { text } = groups![index];

  return (
    <Box
      alignItems="flex-end"
      bgcolor="background.paper"
      borderBottom="1px solid"
      borderColor="border.main"
      color="text.primary"
      display="flex"
      height={70}
      mx="auto"
      width="89%"
    >
      <Typography fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
        {text}
      </Typography>
    </Box>
  );
});

export default GroupRow;
