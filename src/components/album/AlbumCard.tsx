import { SvgIcon } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { RiAlbumFill } from 'react-icons/ri';
import { Link, NavigateFunction } from 'react-router-dom';
import { Album, Library } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import styles from 'styles/MotionImage.module.scss';
import { AlbumWithSection, CardMeasurements } from 'types/interfaces';

interface Map {
  [key: string]: string;
}

const sections: Map = {
  Albums: 'Album',
  'Singles & EPs': 'Single / EP',
  Soundtracks: 'Soundtrack',
  Compilations: 'Compilation',
  'Live Albums': 'Live Album',
  Demos: 'Demo',
  Remixes: 'Remix',
  'Appears On': 'Guest Appearance',
};

interface AlbumCardProps {
  album: Album;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Album[];
  metaText?: string;
  navigate: NavigateFunction;
  section?: string;
  showArtistTitle?: boolean;
}

const AlbumCard = ({
  album,
  handleContextMenu,
  library,
  measurements,
  menuTarget,
  metaText,
  navigate,
  section,
  showArtistTitle,
}: AlbumCardProps) => {
  const menuOpen = menuTarget.length > 0 && menuTarget.map((el) => el.id).includes(album.id);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: album.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  return (
    <MotionBox
      className={styles.container}
      data-id={album.id}
      data-section={section}
      height={measurements.ROW_HEIGHT}
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
      width={measurements.IMAGE_SIZE}
      onClick={() => navigate(`/albums/${album.id}`)}
      onContextMenu={handleContextMenu}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_SIZE - 24}
        margin="12px"
        style={{
          borderRadius: '4px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={menuOpen ? {} : imageMotion}
        width={measurements.IMAGE_SIZE - 24}
      >
        {!album.thumb && (
          <SvgIcon
            className="generic-icon"
            sx={{ color: 'common.grey' }}
          >
            <RiAlbumFill />
          </SvgIcon>
        )}
      </MotionBox>
      <Title marginX="12px">
        {album.title}
      </Title>
      {showArtistTitle && (
        <Subtitle marginX="12px">
          <Link
            className="link"
            state={{
              guid: album.parentGuid,
              title: album.parentTitle,
            }}
            to={`/artists/${album.parentId}`}
            onClick={(e) => e.stopPropagation()}
          >
            {album.parentTitle}
          </Link>
        </Subtitle>
      )}
      <Subtitle marginX="12px">
        {metaText === 'addedAt' && (
          album.addedAt ? moment(album.addedAt).fromNow() : 'no date added'
        )}
        {metaText === 'lastViewedAt' && (
          album.lastViewedAt ? moment(album.lastViewedAt).fromNow() : 'unplayed'
        )}
        {metaText === 'originallyAvailableAt' && (
          album.originallyAvailableAt
            ? moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY')
            : 'no release date'
        )}
        {metaText === 'section' && (
          <>
            {sections[(album as AlbumWithSection).section]}
          </>
        )}
        {metaText === 'title' && (
          <>
            {sections[(album as AlbumWithSection).section]}
          </>
        )}
        {metaText === 'viewCount' && (
          album.viewCount
            ? `${album.viewCount} ${album.viewCount > 1 ? 'plays' : 'play'}`
            : 'unplayed'
        )}
        {metaText === 'year' && (
          album.year ? album.year : 'no year'
        )}
      </Subtitle>
    </MotionBox>
  );
};

AlbumCard.defaultProps = {
  metaText: undefined,
  section: 'Albums',
  showArtistTitle: true,
};

export default AlbumCard;
