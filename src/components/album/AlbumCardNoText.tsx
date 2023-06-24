import { SvgIcon } from '@mui/material';
import React from 'react';
import { RiAlbumFill } from 'react-icons/ri';
import { NavigateFunction } from 'react-router-dom';
import { Album, Library } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import Tooltip from 'components/tooltip/Tooltip';
import styles from 'styles/MotionImage.module.scss';
import { CardMeasurements } from 'types/interfaces';

interface AlbumCardNoTextProps {
  album: Album;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Album[];
  navigate: NavigateFunction;
  section?: string;
}

const AlbumCardNoText = ({
  album,
  handleContextMenu,
  library,
  measurements,
  menuTarget,
  navigate,
  section,
}: AlbumCardNoTextProps) => {
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
      height={measurements.IMAGE_SIZE}
      justifyContent="center"
      key={album.id}
      whileHover="hover"
      width={measurements.IMAGE_SIZE}
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
          height={measurements.IMAGE_SIZE}
          style={{
            '--img': `url(${thumbSrc})`,
          } as React.CSSProperties}
          variants={menuOpen ? {} : imageMotion}
          width={measurements.IMAGE_SIZE}
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
      </Tooltip>
    </MotionBox>
  );
};

AlbumCardNoText.defaultProps = {
  section: 'Albums',
};

export default AlbumCardNoText;
