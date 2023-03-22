import { Box, SvgIcon } from '@mui/material';
import { Playlist } from 'hex-plex';
import React from 'react';
import { BsMusicNoteList } from 'react-icons/all';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import styles from 'styles/MotionImage.module.scss';
import { PlaylistsContext, RowProps } from './Playlists';

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
        borderRadius: '32px',
        contain: 'paint',
      }}
      whileHover="hover"
      width={measurements.IMAGE_SIZE}
      onClick={() => navigate(`/playlists/${playlist.id}`)}
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
        gap="8px"
        height={measurements.ROW_HEIGHT + 8}
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
