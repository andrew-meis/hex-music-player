import { Box } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
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
    <AnimatePresence mode="wait">
      <FilterDrawer key="filter" />
      <ColumnSettingsDrawer key="settings" />
      <LyricsButton key="lyrics" />
      <QueueDrawer key="queue" />
      <VolumeSlider key="volume" />
      <AddToPlaylistDrawer key="add" />
    </AnimatePresence>
  </Box>
);

export default Drawers;
