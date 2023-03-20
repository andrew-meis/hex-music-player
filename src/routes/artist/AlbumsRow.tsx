import { Box } from '@mui/material';
import { Album, Library } from 'hex-plex';
import moment from 'moment';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import Tooltip from 'components/tooltip/Tooltip';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import styles from 'styles/MotionImage.module.scss';
import { IAppSettings } from 'types/interfaces';
import { AlbumWithSection, Measurements, RowProps } from './Artist';

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
    if (!album.lastViewedAt) return 'unplayed';
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
  menuTarget: Album[];
  navigate: NavigateFunction;
  settings: IAppSettings;
  sort: { by: string, order: string };
}

const AlbumCover = ({
  album, handleContextMenu, library, measurements, menuTarget, navigate, settings, sort,
}: AlbumCoverProps) => {
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(album.id);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  if (settings.albumText) {
    return (
      <MotionBox
        className={styles.container}
        data-id={album.id}
        data-section={album.section}
        height={measurements.CARD_HEIGHT}
        key={album.id}
        sx={{
          backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
          borderRadius: '4px',
          contain: 'paint',
          '&:hover': {
            backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
          },
        }}
        whileHover="hover"
        width={measurements.CARD_WIDTH}
        onClick={() => navigate(`/albums/${album.id}`)}
        onContextMenu={handleContextMenu}
      >
        <MotionBox
          className={styles.image}
          height={measurements.CARD_WIDTH - 24}
          margin="12px"
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          variants={menuOpen ? {} : imageMotion}
          width={measurements.CARD_WIDTH - 24}
        />
        <Title marginX="12px">{album.title}</Title>
        <Subtitle marginX="12px">{getAdditionalText(album, sort.by)}</Subtitle>
      </MotionBox>
    );
  }

  return (
    <MotionBox
      className={styles.container}
      data-id={album.id}
      data-section={album.section}
      height={measurements.CARD_WIDTH}
      justifyContent="center"
      key={album.id}
      whileHover="hover"
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
        <MotionBox
          className={styles.image}
          height={measurements.CARD_WIDTH}
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          variants={menuOpen ? {} : imageMotion}
          width={measurements.CARD_WIDTH}
          onClick={() => navigate(`/albums/${album.id}`)}
        />
      </Tooltip>
    </MotionBox>
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
      gap="8px"
      height={measurements.CARD_HEIGHT + 8}
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
