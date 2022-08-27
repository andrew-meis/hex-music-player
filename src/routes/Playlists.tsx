import { Paper, Typography } from '@mui/material';
import React from 'react';

const Playlists = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        width: '70%',
        maxWidth: '600px',
        backgroundColor: 'transparent',
        pt: 2,
        margin: 'auto',
      }}
    >
      <Typography sx={{ fontWeight: 600 }} variant="h4">Playlists</Typography>
    </Paper>
  );
};

export default Playlists;
