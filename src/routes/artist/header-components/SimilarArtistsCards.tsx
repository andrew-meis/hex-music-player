import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { BiChevronRight, IoMdMicrophone } from 'react-icons/all';
import { Link } from 'react-router-dom';
import {
  MotionBox, MotionSvg, MotionTypography,
} from 'components/motion-components/motion-components';
import { iconMotion, tracklistMotion } from 'components/motion-components/motion-variants';
import { WIDTH_CALC } from 'constants/measures';
import { ArtistContext } from '../Artist';
import type { Artist } from 'hex-plex';

const textStyle = {
  color: 'text.primary',
  display: '-webkit-box',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  lineHeight: 1.2,
  mt: '2px',
  mx: '8px',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  WebkitLineClamp: 1,
  wordBreak: 'break-all',
};

interface SimilarArtistsCardsProps {
  activeIndex: number;
  artist: Artist;
  context: ArtistContext;
  difference: number;
  similarArtists: Artist[];
}

const SimilarArtistsCards = ({
  activeIndex, artist, context, difference, similarArtists: allSimilarArtists,
}: SimilarArtistsCardsProps) => {
  const { cols, library, measurements, navigate } = context;
  const length = (cols - 1) * 2;
  const similarArtists = allSimilarArtists
    .slice((activeIndex * length), (activeIndex * length + length));
  return (
    <Box display="flex" flexDirection="column" margin="auto" width={WIDTH_CALC}>
      <MotionTypography
        color="text.primary"
        fontFamily="TT Commons"
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
      <AnimatePresence custom={difference} initial={false} mode="wait">
        <MotionBox
          alignContent="space-between"
          animate={{ x: 0, opacity: 1 }}
          custom={difference}
          display="flex"
          exit="exit"
          flexWrap="wrap"
          initial="enter"
          key={activeIndex}
          minHeight={allSimilarArtists.length > 3 ? 148 : 0}
          transition={{ duration: 0.2 }}
          variants={tracklistMotion}
        >
          {similarArtists?.map((similarArtist, index) => {
            const thumbSrc = library.api
              .getAuthenticatedUrl(
                '/photo/:/transcode',
                { url: similarArtist.thumb, width: 100, height: 100 },
              );
            return (
              <Box
                alignItems="center"
                borderRadius="12px"
                display="flex"
                height={70}
                key={similarArtist.id}
                sx={{
                  cursor: 'pointer',
                  marginRight: (index + 1) % (cols - 1) === 0 ? '0px' : '8px',
                  transition: '0.2s',
                  '& > div.MuiAvatar-root': {
                    transition: '0.2s',
                    filter: 'grayscale(60%)',
                  },
                  '&:hover': {
                    backgroundColor: 'action.hover',
                    '& > div.MuiAvatar-root': {
                      filter: 'none',
                    },
                  },
                }}
                width={measurements.SIMILAR_CARD_WIDTH - (8 / ((cols - 1) / (cols - 2)))}
                onClick={() => navigate(
                  `/artists/${similarArtist.id}`,
                  { state: { guid: similarArtist.guid, title: similarArtist.title } },
                )}
              >
                <Avatar
                  alt={similarArtist.title}
                  src={similarArtist.thumb ? thumbSrc : ''}
                  sx={{
                    height: 60,
                    marginLeft: '8px',
                    width: 60,
                  }}
                >
                  <SvgIcon className="generic-icon" sx={{ color: 'common.black' }}>
                    <IoMdMicrophone />
                  </SvgIcon>
                </Avatar>
                <Box>
                  <Typography sx={textStyle}>
                    {similarArtist.title}
                  </Typography>
                  <Typography
                    sx={{
                      ...textStyle,
                      color: 'text.secondary',
                      fontSize: '0.875rem',
                    }}
                    variant="subtitle2"
                  >
                    {similarArtist.genre.map(
                      // eslint-disable-next-line max-len
                      (genre, i, a) => `${genre.tag.toLowerCase()}${i !== a.length - 1 ? ', ' : ''}`,
                    )}
                  </Typography>
                </Box>
              </Box>
            );
          })}
        </MotionBox>
      </AnimatePresence>
    </Box>
  );
};

export default SimilarArtistsCards;
