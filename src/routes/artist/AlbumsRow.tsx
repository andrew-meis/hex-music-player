import { Box, Tooltip, Typography } from '@mui/material';
import { Album, Library } from 'hex-plex';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import styles from 'styles/AlbumsRow.module.scss';
import usePalette, { defaultColors } from '../../hooks/usePalette';
import { AppSettings } from '../../types/interfaces';
import { RowProps } from './Artist';

const textStyle = {
  color: 'text.primary',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.2,
  mt: '2px',
  mx: '8px',
};

interface AlbumCoverProps {
  album: Album;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  library: Library;
  navigate: NavigateFunction;
  menuTarget: number | undefined;
  section: string;
  settings: AppSettings;
  width: number;
}

const AlbumCover = ({
  album, grid, handleContextMenu, library, menuTarget, navigate, section, settings, width,
}: AlbumCoverProps) => {
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );
  const { data: palette, isError } = usePalette(album.id, thumbSrc);

  const backgroundColor = () => {
    if (isError || !palette) {
      return settings.colorMode === 'light'
        ? `${defaultColors.vibrant}66`
        : `${defaultColors.vibrant}e6`;
    }
    return settings.colorMode === 'light'
      ? `${palette.vibrant}66`
      : `${palette.vibrant}e6`;
  };

  if (settings.albumText) {
    return (
      <Box
        className={styles['album-box']}
        data-id={album.id}
        data-section={section}
        height={Math.floor((width * 0.89) / grid.cols) + 70}
        key={album.id}
        sx={{
          backgroundColor: menuTarget === album.id ? backgroundColor() : '',
          '&:hover': { backgroundColor: backgroundColor() },
        }}
        width={Math.floor((width * 0.89) / grid.cols)}
        onClick={() => navigate(`/albums/${album.id}`)}
        onContextMenu={handleContextMenu}
      >
        <Box
          className={styles['album-cover']}
          height={Math.floor((width * 0.89) / grid.cols) - 8}
          margin="4px"
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          sx={{ transform: menuTarget === album.id ? 'scale(1) translateZ(0px)' : '' }}
          width={Math.floor((width * 0.89) / grid.cols) - 8}
        />
        <Typography sx={textStyle}>
          {album.title}
        </Typography>
        <Typography color="text.primary" lineHeight={2} mx="8px" variant="subtitle2">
          {album.originallyAvailableAt
            .toLocaleDateString(
              'en-gb',
              { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
            )}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className={styles['album-box']}
      data-id={album.id}
      data-section={section}
      height={Math.floor((width * 0.89) / grid.cols)}
      key={album.id}
      width={Math.floor((width * 0.89) / grid.cols)}
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
          height={Math.floor((width * 0.89) / grid.cols)}
          margin="2px"
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          sx={{ transform: menuTarget === album.id ? 'scale(1) translateZ(0px)' : '' }}
          onClick={() => navigate(`/albums/${album.id}`)}
        />
      </Tooltip>
    </Box>
  );
};

const AlbumsRow = React.memo(({ index, context }: RowProps) => {
  const {
    grid, handleContextMenu, items: { rows }, library, menuTarget, navigate, settings, width,
  } = context;
  const { albums, section } = rows![index];
  return (
    <Box
      display="flex"
      height={((width * 0.89) / grid.cols) + (settings.albumText ? 70 : 0)}
      mx="auto"
      width={(width * 0.89)}
    >
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
          settings={settings}
          width={width}
        />
      ))}
    </Box>
  );
});

export default AlbumsRow;
