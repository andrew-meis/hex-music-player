import { SvgIcon } from '@mui/material';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { RiAlbumFill } from 'react-icons/ri';
import { Link, NavigateFunction } from 'react-router-dom';
import { Album, Library } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import styles from 'styles/MotionImage.module.scss';
import { DragTypes } from 'types/enums';
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

  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.ALBUM,
    item: () => [album],
  }), [album]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, album]);

  return (
    <MotionBox
      className={styles.container}
      data-id={album.id}
      data-section={section}
      height={measurements.ROW_HEIGHT}
      key={album.id}
      ref={drag}
      width={measurements.IMAGE_SIZE}
      onContextMenu={handleContextMenu}
    >
      <MotionBox
        bgcolor="action.selected"
        className={styles.image}
        flexDirection="column-reverse"
        height={measurements.IMAGE_SIZE - 8}
        style={{
          borderRadius: '4px',
          cursor: 'pointer',
          margin: '4px',
          transition: '0.2s',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        variants={menuOpen ? {} : imageMotion}
        whileHover="hover"
        width={measurements.IMAGE_SIZE - 8}
        onClick={() => navigate(`/albums/${album.id}`)}
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
      <Title marginX={0.5}>
        <Link
          className="link"
          to={`/albums/${album.id}`}
          onClick={(e) => e.stopPropagation()}
        >
          {album.title}
        </Link>
      </Title>
      <Subtitle marginX={0.5}>
        {showArtistTitle && (
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
        )}
        {metaText === 'addedAt' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {album.addedAt ? moment(album.addedAt).fromNow() : 'no date added'}
          </>
        )}
        {metaText === 'lastViewedAt' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {album.lastViewedAt ? moment(album.lastViewedAt).fromNow() : 'unplayed'}
          </>
        )}
        {metaText === 'originallyAvailableAt' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {album.originallyAvailableAt
              ? moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY')
              : 'no release date'}
          </>
        )}
        {metaText === 'section' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {sections[(album as AlbumWithSection).section]}
          </>
        )}
        {metaText === 'title' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {sections[(album as AlbumWithSection).section]}
          </>
        )}
        {metaText === 'viewCount' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {album.viewCount
              ? `${album.viewCount} ${album.viewCount > 1 ? 'plays' : 'play'}`
              : 'unplayed'}
          </>
        )}
        {metaText === 'year' && (
          <>
            {showArtistTitle ? <>&nbsp;·&nbsp;</> : ''}
            {album.year ? album.year : 'no year'}
          </>
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

export default React.memo(AlbumCard);
