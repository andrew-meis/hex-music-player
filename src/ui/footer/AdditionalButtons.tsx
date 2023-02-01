import { Box } from '@mui/material';
import LyricsButton from './LyricsButton';
import QueueDrawer from './QueueDrawer';
import VolumeSlider from './VolumeSlider';

const AdditionalButtons = () => (
  <Box
    sx={{
      alignItems: 'center',
      display: 'flex',
      flexDirection: 'row',
      height: '100%',
      justifyContent: 'flex-end',
    }}
    width={1}
  >
    <LyricsButton />
    <QueueDrawer />
    <VolumeSlider />
  </Box>
);

export default AdditionalButtons;
