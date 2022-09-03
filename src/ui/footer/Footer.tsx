import { Box, Grid } from '@mui/material';
import React from 'react';
import AdditionalButtons from './AdditionalButtons';
import MediaButtons from './MediaButtons';
import NowPlaying from './NowPlaying';
import Seekbar from './Seekbar';

const Footer = () => (
  <Box
    bgcolor="background.default"
    bottom={0}
    height={90}
    position="absolute"
    width={1}
  >
    <Grid
      container
      height={90}
      sx={{
        borderTop: '1px solid',
        borderColor: 'border.main',
      }}
    >
      <Grid item xs>
        <NowPlaying />
      </Grid>
      <Grid item maxWidth="600px !important" xs={7}>
        <Box height="20%" />
        <MediaButtons />
        <Seekbar />
      </Grid>
      <Grid item xs>
        <AdditionalButtons />
      </Grid>
    </Grid>
  </Box>
);

export default Footer;
