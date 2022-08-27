import { Box, Tooltip, Typography } from '@mui/material';
import { Album, Library } from 'hex-plex';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import styles from 'styles/AlbumsRow.module.scss';
import { RowProps } from './Artist';

interface AlbumCoverProps {
  album: Album;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  library: Library;
  navigate: NavigateFunction;
  menuTarget: number | undefined;
  section: string;
  width: number;
}

const AlbumCover = ({
  album, grid, handleContextMenu, library, menuTarget, navigate, section, width,
}: AlbumCoverProps) => {
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );
  return (
    <Box
      data-id={album.id}
      data-section={section}
      height={(width * 0.89) / grid.cols}
      key={album.id}
      width={(width * 0.89) / grid.cols}
      onContextMenu={handleContextMenu}
    >
      <Tooltip
        arrow
        enterDelay={500}
        enterNextDelay={300}
        key={album.id}
        title={<Typography color="text.primary" textAlign="center">{album.title}</Typography>}
      >
        <Box
          className={styles['album-cover']}
          height="-webkit-fill-available"
          margin="2px"
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          sx={{ transform: menuTarget === album.id ? 'scale(1) translateZ(0px)' : '' }}
          width="auto"
          onClick={() => navigate(`/albums/${album.id}`)}
        />
      </Tooltip>
    </Box>
  );
};

const AlbumsRow = React.memo(({ index, context }: RowProps) => {
  const {
    grid, handleContextMenu, items: { rows }, library, menuTarget, navigate, width,
  } = context;
  const { albums, section } = rows![index];
  return (
    <Box display="flex" height={(width * 0.89) / grid.cols} mx="auto" width={(width * 0.89)}>
      {albums!.map((album) => (
        <AlbumCover
          album={album}
          grid={grid}
          handleContextMenu={handleContextMenu}
          key={album.id}
          library={library}
          menuTarget={menuTarget}
          navigate={navigate}
          section={section}
          width={width}
        />
      ))}
    </Box>
  );
});

export default AlbumsRow;
