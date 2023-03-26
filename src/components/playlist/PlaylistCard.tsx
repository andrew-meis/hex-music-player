import { SvgIcon } from '@mui/material';
import { Library, Playlist } from 'hex-plex';
import React, { useMemo } from 'react';
import { BsMusicNoteList } from 'react-icons/all';
import { NavigateFunction } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import { usePlaylist } from 'queries/playlist-queries';
import styles from 'styles/MotionImage.module.scss';
import { CardMeasurements } from 'types/interfaces';

interface PlaylistCardProps {
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  id: number;
  library: Library;
  menuTarget: Playlist[];
  measurements: CardMeasurements;
  navigate: NavigateFunction;
}

const PlaylistCard = ({
  handleContextMenu,
  id,
  library,
  measurements,
  menuTarget,
  navigate,
}: PlaylistCardProps) => {
  const { data: playlist, isLoading } = usePlaylist(id, library);
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(id);
  const thumbSrc = useMemo(() => {
    if (!playlist || (!playlist.thumb && !playlist.composite)) return undefined;
    return library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: playlist.thumb || playlist.composite,
        width: 300,
        height: 300,
        minSize: 1,
        upscale: 1,
      },
    );
  }, [library, playlist]);

  return (
    <MotionBox
      className={styles.container}
      data-id={id}
      height={measurements.ROW_HEIGHT}
      key={id}
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
      onClick={() => navigate(`/playlists/${id}`)}
      onContextMenu={handleContextMenu}
    >
      {!isLoading && !!playlist && (
        <MotionBox
          animate={{ opacity: 1 }}
          initial={{ opacity: 0 }}
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
            {!thumbSrc && (
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
      )}
    </MotionBox>
  );
};

export default PlaylistCard;
