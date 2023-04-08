import { Box, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { BiAlbum } from 'react-icons/all';
import { GroupRowProps } from './Album';

const GroupRow = React.memo(({ context, discNumber }: GroupRowProps) => (
  <Box
    alignItems="center"
    color="text.primary"
    display="flex"
    height={56}
    onMouseEnter={() => {
      context.hoverIndex.current = null;
    }}
  >
    <Box maxWidth="10px" width="10px" />
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        width: '40px',
        textAlign: 'center',
        flexShrink: 0,
      }}
    >
      <SvgIcon>
        <BiAlbum />
      </SvgIcon>
    </Box>
    <Typography sx={{ ml: '10px' }}>
      {`Disc ${discNumber}`}
    </Typography>
  </Box>
));

export default GroupRow;
