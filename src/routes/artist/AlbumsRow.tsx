import { Box, Typography } from '@mui/material';
import { Library } from 'hex-plex';
import moment from 'moment';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import Tooltip from 'components/tooltip/Tooltip';
import usePalette, { defaultColors } from 'hooks/usePalette';
import styles from 'styles/AlbumsRow.module.scss';
import { IAppSettings } from 'types/interfaces';
import { AlbumWithSection, Measurements, RowProps } from './Artist';

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

interface Map {
  [key: string]: string;
}

const typeMap: Map = {
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
    return moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');
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
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  library: Library;
  measurements: Measurements;
  menuTarget: number | undefined;
  navigate: NavigateFunction;
  settings: IAppSettings;
  sort: { by: string, order: string };
}

const AlbumCover = ({
  album, handleContextMenu, library, measurements, menuTarget, navigate, settings, sort,
}: AlbumCoverProps) => {
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );
  const thumbUrl = library.api.getAuthenticatedUrl(album.thumb);
  const { data: palette, isError } = usePalette(album.thumb, thumbUrl);

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
        height={measurements.ROW_HEIGHT}
        key={album.id}
        sx={{
          backgroundColor: menuTarget === album.id ? backgroundColor() : '',
          '&:hover': { backgroundColor: backgroundColor() },
        }}
        width={measurements.CARD_WIDTH}
        onClick={() => navigate(`/albums/${album.id}`)}
        onContextMenu={handleContextMenu}
      >
        <Box
          className={styles['album-cover']}
          height={measurements.COVER_HEIGHT}
          margin="4px"
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          sx={{ transform: menuTarget === album.id ? 'scale(1) translateZ(0px)' : '' }}
          width={measurements.COVER_WIDTH}
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
      height={measurements.ROW_HEIGHT}
      justifyContent="center"
      key={album.id}
      width={measurements.CARD_WIDTH}
      onContextMenu={handleContextMenu}
    >
      <Tooltip
        arrow
        PopperProps={{
          modifiers: [
            {
              name: 'offset',
              options: {
                offset: [0, -5],
              },
            },
          ],
        }}
        enterDelay={500}
        enterNextDelay={300}
        key={album.id}
        title={album.title}
      >
        <Box
          className={styles['album-cover']}
          height={measurements.COVER_HEIGHT}
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          sx={{ transform: menuTarget === album.id ? 'scale(1) translateZ(0px)' : '' }}
          width={measurements.COVER_WIDTH}
          onClick={() => navigate(`/albums/${album.id}`)}
        />
      </Tooltip>
    </Box>
  );
};

const AlbumsRow = React.memo(({ item, context }: RowProps) => {
  const {
    handleContextMenu, library, measurements, menuTarget, navigate, settings, sort,
  } = context;
  const { albums } = item;
  return (
    <Box
      display="flex"
      height={measurements.ROW_HEIGHT}
      mx="auto"
      width={measurements.ROW_WIDTH}
    >
      {albums!.map((album) => (
        <AlbumCover
          album={album}
          handleContextMenu={handleContextMenu}
          key={album.id}
          library={library}
          measurements={measurements}
          menuTarget={menuTarget}
          navigate={navigate}
          settings={settings}
          sort={sort}
        />
      ))}
    </Box>
  );
});

export default AlbumsRow;
