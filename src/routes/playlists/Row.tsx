import { Box } from '@mui/material';
import React from 'react';
import PlaylistCard from 'components/playlist/PlaylistCard';
import { RowProps } from './Playlists';

const Row = React.memo(({ playlists, context }: RowProps) => {
  const {
    handleContextMenu, measurements, menuTarget,
  } = context;

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        gap="8px"
        height={measurements.ROW_HEIGHT + 8}
        mx="auto"
        width={measurements.ROW_WIDTH}
      >
        {playlists.map((playlist) => (
          <PlaylistCard
            handleContextMenu={handleContextMenu}
            id={playlist.id}
            key={playlist.id}
            library={context.library}
            measurements={context.measurements}
            menuTarget={menuTarget}
            navigate={context.navigate}
          />
        ))}
      </Box>
    </Box>
  );
});

export default Row;
