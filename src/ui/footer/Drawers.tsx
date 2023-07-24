import { Box } from '@mui/material';
import AddToPlaylistDrawer from './drawers/AddToPlaylistDrawer';
import ColumnSettingsDrawer from './drawers/ColumnSettingsDrawer';
import FilterDrawer from './drawers/FilterDrawer';
import QueueDrawer from './drawers/QueueDrawer';
import LyricsButton from './LyricsButton';
import VolumeSlider from './media-control/VolumeSlider';

const Drawers = () => (
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
    <FilterDrawer />
    <ColumnSettingsDrawer />
    <QueueDrawer />
    <VolumeSlider />
    <AddToPlaylistDrawer />
  </Box>
);

export default Drawers;
