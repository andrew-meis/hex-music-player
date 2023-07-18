import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { UseQueryResult } from '@tanstack/react-query';
import React, { useRef } from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Album, Artist, Hub, Library, Track } from 'api/index';
import { ArtistMenu, MenuIcon } from 'components/menus';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import TrackCarousel from 'components/track/TrackCarousel';
import { PlayParams } from 'hooks/usePlayback';
import { thresholds } from 'routes/artist/Header';
import { PlayActions } from 'types/enums';

const ArtistPreview: React.FC<{
  library: Library,
  openArtist: Pick<Artist, 'id' | 'guid' | 'title'>;
  openArtistQuery: UseQueryResult<{albums: Album[], artist: Artist, hubs: Hub[]}>,
  openArtistTracksQuery: UseQueryResult<Track[]>;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
}> = ({
  library,
  openArtist,
  openArtistQuery,
  openArtistTracksQuery,
  playSwitch,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuProps, toggleMenu] = useMenuState({ transition: true, unmountOnClose: true });
  const { ref, entry } = useInView({ threshold: thresholds });

  return (
    <Box
      height={1}
      margin="auto"
    >
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        justifyContent="space-between"
        width={1}
      >
        <MotionTypography
          color="text.primary"
          fontFamily="TT Commons, sans-serif"
          fontSize="1.625rem"
          marginRight="auto"
          whileHover="hover"
          width="fit-content"
        >
          <Link
            className="link"
            state={{
              guid: openArtistQuery.data!.artist.guid,
              title: openArtistQuery.data!.artist.title,
            }}
            to={`/artists/${openArtist.id}`}
          >
            {openArtistQuery.data!.artist.title}
            <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
              <BiChevronRight />
            </MotionSvg>
          </Link>
        </MotionTypography>
        <MenuIcon
          height={39}
          menuRef={menuRef}
          menuState={menuProps.state}
          toggleMenu={toggleMenu}
          width={24}
        />
      </Box>
      <Box
        display="flex"
        flexDirection="column"
        ref={ref}
      >
        {
          entry && entry.intersectionRatio > 0.3
            ? (
              <TrackCarousel
                library={library}
                rows={5}
                tracks={openArtistTracksQuery.data!}
              />
            )
            : (
              <Box height={224} width={1} />
            )
        }
      </Box>
      <ArtistMenu
        arrow
        align="center"
        anchorRef={menuRef}
        artists={[openArtistQuery.data!.artist]}
        direction="right"
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
        }}
        {...menuProps}
      />
    </Box>
  );
};

export default ArtistPreview;
