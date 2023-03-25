import { SvgIcon } from '@mui/material';
import { Artist, Library } from 'hex-plex';
import React from 'react';
import { IoMdMicrophone } from 'react-icons/all';
import { NavigateFunction } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import { ArtistPreview } from 'routes/genre/Genre';
import styles from 'styles/MotionImage.module.scss';
import { isArtist } from 'types/type-guards';

export interface Measurements {
  IMAGE_SIZE: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

interface ArtistCardProps {
  artist: Artist | ArtistPreview;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  library: Library;
  measurements: Measurements;
  menuTarget: Artist[];
  navigate: NavigateFunction;
}

const ArtistCard = ({
  artist, handleContextMenu, library, measurements, menuTarget, navigate,
}: ArtistCardProps) => {
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(artist.id);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: artist.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  return (
    <MotionBox
      className={styles.container}
      data-id={artist.id}
      height={measurements.ROW_HEIGHT}
      key={artist.id}
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
      onClick={() => navigate(
        `/artists/${artist.id}`,
        { state: { guid: artist.guid, title: artist.title } },
      )}
      onContextMenu={handleContextMenu}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={(measurements.IMAGE_SIZE * 0.70) - 24}
        margin="12px"
        style={{
          borderRadius: '32px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={imageMotion}
        width={measurements.IMAGE_SIZE - 24}
      >
        {!artist.thumb && (
          <SvgIcon
            className="generic-icon"
            sx={{ color: 'common.grey' }}
          >
            <IoMdMicrophone />
          </SvgIcon>
        )}
      </MotionBox>
      <Title marginX="12px" textAlign="center">
        {artist.title}
      </Title>
      <Subtitle
        marginX="12px"
        textAlign="center"
      >
        {isArtist(artist) && artist.genre.slice(0, 2).map(
          (g, i, a) => `${g.tag.toLowerCase()}${i !== a.length - 1 ? ', ' : ''}`,
        )}
        {!isArtist(artist) && (
          artist.viewCount
            ? `${artist.viewCount} ${artist.viewCount > 1 ? 'plays in genre' : 'play in genre'}`
            : 'unplayed'
        )}
      </Subtitle>
    </MotionBox>
  );
};

export default ArtistCard;
