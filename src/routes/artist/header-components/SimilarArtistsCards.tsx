import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useCallback, useState } from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { Link } from 'react-router-dom';
import { Artist } from 'api/index';
import { ArtistMenu } from 'components/menus';
import {
  MotionBox,
  MotionSvg,
  MotionTypography,
} from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import { ArtistContext } from '../Artist';
import SimilarArtistCard from './SimilarArtistCard';

const SimilarArtistsCards: React.FC<{
  artist: Artist;
  context: ArtistContext;
  similarArtists: Artist[];
}> = ({
  artist,
  context,
  similarArtists: allSimilarArtists,
}) => {
  const { cols, library, navigate, playSwitch, width } = context;
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });

  const cardWidth = (Math.floor((width - VIEW_PADDING) / (cols - 1)));
  const length = (cols - 1);
  const similarArtists = allSimilarArtists.slice(0, length);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(similarArtists
      .filter((similarArtist) => similarArtist)
      .filter((similarArtist) => similarArtist.id === targetId) as Artist[]);
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [similarArtists, toggleMenu]);

  return (
    <Box display="flex" flexDirection="column" margin="auto" width={WIDTH_CALC}>
      <MotionTypography
        color="text.primary"
        fontFamily="TT Commons, sans-serif"
        fontSize="1.625rem"
        whileHover="hover"
        width="fit-content"
      >
        <Link
          className="link"
          to={`/artists/${artist.id}/similar`}
        >
          Similar Artists
          <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
            <BiChevronRight />
          </MotionSvg>
        </Link>
      </MotionTypography>
      <Box
        alignContent="space-between"
        display="flex"
        minHeight={70 + 32}
      >
        {similarArtists?.map((similarArtist, index) => (
          <SimilarArtistCard
            cardWidth={cardWidth}
            cols={cols}
            handleContextMenu={handleContextMenu}
            index={index}
            key={similarArtist.id}
            library={library}
            menuTarget={menuTarget}
            navigate={navigate}
            similarArtist={similarArtist}
          />
        ))}
        <MotionBox
          alignItems="center"
          borderRadius="12px"
          display="flex"
          height={70}
          justifyContent="center"
          ml={1}
          sx={{
            color: 'text.secondary',
            cursor: 'pointer',
            transition: '0.2s',
            '&:hover': {
              backgroundColor: 'action.hover',
              color: 'text.primary',
            },
          }}
          whileHover="hover"
          width={70}
          onClick={() => navigate(`/artists/${artist.id}/similar`)}
        >
          <MotionSvg
            sx={{ width: '2em', height: '2em' }}
            variants={iconMotion}
            viewBox="0 0 24 24"
          >
            <BiChevronRight />
          </MotionSvg>
        </MotionBox>
      </Box>
      <ArtistMenu
        anchorPoint={anchorPoint}
        artists={menuTarget}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
          setMenuTarget([]);
        }}
        {...menuProps}
      />
    </Box>
  );
};

export default SimilarArtistsCards;
