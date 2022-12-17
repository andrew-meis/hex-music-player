import { Box, Typography } from '@mui/material';
import { Library } from 'hex-plex';
import moment from 'moment';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import Tooltip from 'components/tooltip/Tooltip';
import usePalette, { defaultColors } from 'hooks/usePalette';
import styles from 'styles/AlbumsRow.module.scss';
import { IAppSettings } from 'types/interfaces';
import { AlbumWithSection, RowProps } from './Artist';

const textStyle = {
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  lineHeight: 1.2,
  mt: '2px',
  mx: '8px',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

const typeMap = {
  Albums: 'Album',
  'Singles & EPs': 'Single / EP',
  Soundtracks: 'Soundtrack',
  Compilations: 'Compilation',
  'Live Albums': 'Live Album',
  Demos: 'Demo',
  Remixes: 'Remix',
  'Appears On': 'Guest Appearance',
};

const getAdditionalText = (album: AlbumWithSection, by: string) => {
  if (by === 'added') {
    return moment(album.addedAt).fromNow();
  }
  if (by === 'date') {
    return album.originallyAvailableAt
      .toLocaleDateString(
        'en-gb',
        { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
      );
  }
  if (by === 'played') {
    return moment(album.lastViewedAt).fromNow();
  }
  if (by === 'plays') {
    return (album.viewCount
      ? `${album.viewCount} ${album.viewCount > 1 ? 'plays' : 'play'}`
      : 'unplayed');
  }
  if (by === 'title') {
    // @ts-ignore
    const text = typeMap[album.section];
    return text.toLowerCase();
  }
  if (by === 'type') {
    // @ts-ignore
    const text = typeMap[album.section];
    return text.toLowerCase();
  }
  return '';
};

interface AlbumCoverProps {
  album: AlbumWithSection;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  library: Library;
  navigate: NavigateFunction;
  menuTarget: number | undefined;
  settings: IAppSettings;
  sort: { by: string, order: string };
  width: number;
}

const AlbumCover = ({
  album, grid, handleContextMenu, library, menuTarget, navigate, settings, sort, width,
}: AlbumCoverProps) => {
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );
  const { data: palette, isError } = usePalette(album.thumb, thumbSrc);

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
        data-section={album.section}
        height={Math.floor((width * 0.89) / grid.cols) + 54}
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
          {getAdditionalText(album, sort.by)}
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      className={styles['album-box']}
      data-id={album.id}
      data-section={album.section}
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
        title={album.title}
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

const AlbumsRow = React.memo(({ item, context }: RowProps) => {
  const {
    grid, handleContextMenu, library, menuTarget, navigate, settings, sort, width,
  } = context;
  const { albums } = item;
  return (
    <Box
      display="flex"
      height={((width * 0.89) / grid.cols) + (settings.albumText ? 54 : 0)}
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
          settings={settings}
          sort={sort}
          width={width}
        />
      ))}
    </Box>
  );
});

export default AlbumsRow;
