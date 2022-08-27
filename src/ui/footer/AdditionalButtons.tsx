import { Box } from '@mui/material';
import React from 'react';
import QueueDrawer from './QueueDrawer';
import VolumeSlider from './VolumeSlider';

const AdditionalButtons = () => (
  <Box
    sx={{
      height: '100%',
      display: 'flex',
      justifyContent: 'flex-end',
      alignItems: 'center',
    }}
  >
    <QueueDrawer />
    <VolumeSlider />
  </Box>
);

export default AdditionalButtons;
