import { Box, SvgIcon, Typography } from '@mui/material';
import { Playlist } from 'hex-plex';
import React from 'react';
import { TbPlaylist } from 'react-icons/all';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import styles from 'styles/MotionImage.module.scss';
import { PlaylistsContext, RowProps } from './Playlists';

const textStyle = {
  bottom: '8px',
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  height: '20px',
  lineHeight: 1.2,
  overflow: 'hidden',
  position: 'absolute',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

interface PlaylistCardProps {
  playlist: Playlist;
  context: PlaylistsContext;
}

const PlaylistCard = ({ playlist, context }: PlaylistCardProps) => {
  const {
    library, measurements, navigate,
  } = context;
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
        contain: 'paint',
      }}
      whileHover="hover"
      width={measurements.IMAGE_WIDTH}
      onClick={() => navigate(`/playlists/${playlist.id}`)}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_HEIGHT - 24}
        margin="12px"
        style={{
          borderRadius: '32px',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={imageMotion}
        width={measurements.IMAGE_WIDTH - 24}
      >
        {!playlist.thumb && !playlist.composite && (
          <SvgIcon
            className="generic-icon"
            sx={{ color: 'common.grey' }}
          >
            <TbPlaylist />
          </SvgIcon>
        )}
      </MotionBox>
      <Typography
        sx={{
          ...textStyle,
          textAlign: 'center',
          transition: '200ms',
          width: Math.floor((measurements.IMAGE_WIDTH - 16) * 0.95),
        }}
      >
        {playlist.title}
      </Typography>
    </MotionBox>
  );
};

const Row = React.memo(({ playlists, context }: RowProps) => {
  const {
    measurements,
  } = context;

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        mx="auto"
        width={measurements.ROW_WIDTH}
      >
        {playlists.map((playlist) => (
          <PlaylistCard
            context={context}
            key={playlist.id}
            playlist={playlist}
          />
        ))}
      </Box>
    </Box>
  );
});

export default Row;
