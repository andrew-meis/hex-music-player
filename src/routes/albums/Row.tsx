import { Box } from '@mui/material';
import React from 'react';
import AlbumCard from 'components/album/AlbumCard';
import { RowProps } from './Albums';

const Row = React.memo(({ albums, context }: RowProps) => {
  const {
    handleContextMenu,
    library,
    measurements,
    menuTarget,
    navigate,
    sort,
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
        {albums.map((album) => (
          <AlbumCard
            album={album}
            handleContextMenu={handleContextMenu}
            key={album.id}
            library={library}
            measurements={measurements}
            menuTarget={menuTarget}
            metaText={sort.by}
            navigate={navigate}
          />
        ))}
      </Box>
    </Box>
  );
});

export default Row;
