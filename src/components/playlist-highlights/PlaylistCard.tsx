import { SvgIcon } from '@mui/material';
import { Playlist, Library } from 'hex-plex';
import React from 'react';
import { BsMusicNoteList } from 'react-icons/all';
import { NavigateFunction } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import styles from 'styles/MotionImage.module.scss';

export interface Measurements {
  IMAGE_SIZE: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

interface PlaylistCardProps {
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  library: Library;
  measurements: Measurements;
  menuTarget: Playlist[];
  navigate: NavigateFunction;
  playlist: Playlist;
}

const PlaylistCard = ({
  handleContextMenu, library, measurements, menuTarget, navigate, playlist,
}: PlaylistCardProps) => {
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(playlist.id);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: playlist.thumb || playlist.composite, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  return (
    <MotionBox
      className={styles.container}
      data-id={playlist.id}
      height={measurements.ROW_HEIGHT}
      key={playlist.id}
      sx={{
        backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
        borderRadius: '32px',
        contain: 'paint',
        '&:hover': {
          backgroundColor: menuOpen ? 'var(--mui-palette-action-selected)' : '',
        },
      }}
      whileHover="hover"
      width={measurements.IMAGE_SIZE}
      onClick={() => navigate(`/playlists/${playlist.id}`)}
      onContextMenu={handleContextMenu}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_SIZE - 24}
        margin="12px"
        style={{
          borderRadius: '32px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={imageMotion}
        width={measurements.IMAGE_SIZE - 24}
      >
        {!playlist.thumb && !playlist.composite && (
          <SvgIcon
            className="generic-icon"
            sx={{ color: 'common.grey' }}
          >
            <BsMusicNoteList />
          </SvgIcon>
        )}
      </MotionBox>
      <Title marginX="12px" textAlign="center">
        {playlist.title}
      </Title>
      <Subtitle
        marginX="12px"
        textAlign="center"
      >
        {`${playlist.leafCount} ${playlist.leafCount === 1 ? 'track' : 'tracks'}`}
      </Subtitle>
    </MotionBox>
  );
};

export default PlaylistCard;
