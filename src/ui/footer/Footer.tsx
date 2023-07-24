import { Box, Grid } from '@mui/material';
import Drawers from './Drawers';
import Seekbar from './media-control/Seekbar';
import MediaControl from './MediaControl';
import NowPlaying from './NowPlaying';

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
        <MediaControl />
        <Seekbar />
      </Grid>
      <Grid item xs>
        <Drawers />
      </Grid>
    </Grid>
  </Box>
);

export default Footer;
