import { Avatar, Box, SvgIcon } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { useMemo, useState } from 'react';
import { IoMdMicrophone } from 'react-icons/all';
import { NavigateFunction } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import { Subtitle, Title } from 'components/typography/TitleSubtitle';
import { VIEW_PADDING } from 'constants/measures';
import type { Artist, Library } from 'hex-plex';

interface SimilarArtistsCardsProps {
  artists: Artist[];
  cols: number;
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const SimilarArtistsCards = ({
  artists, cols, library, navigate, width,
}: SimilarArtistsCardsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const difference = prevIndex ? activeIndex - prevIndex : 1;

  const length = (cols - 1) * 2;
  const artistPage = artists
    .slice((activeIndex * length), (activeIndex * length + length));
  const measurements = useMemo(() => ({
    SIMILAR_CARD_WIDTH: (Math.floor((width - VIEW_PADDING) / (cols - 1))),
  }), [cols, width]);

  return (
    <Box display="flex" flexDirection="column" margin="auto">
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
          minHeight={148}
          transition={{ duration: 0.2 }}
          variants={tracklistMotion}
        >
          {artistPage?.map((artist, index) => {
            const thumbSrc = library.api
              .getAuthenticatedUrl(
                '/photo/:/transcode',
                { url: artist.thumb, width: 100, height: 100 },
              );
            return (
              <Box
                alignItems="center"
                borderRadius="12px"
                display="flex"
                height={70}
                key={artist.id}
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
                  `/artists/${artist.id}`,
                  { state: { guid: artist.guid, title: artist.title } },
                )}
              >
                <Avatar
                  alt={artist.title}
                  src={artist.thumb ? thumbSrc : ''}
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
                  <Title marginTop="2px" marginX="8px">
                    {artist.title}
                  </Title>
                  <Subtitle
                    marginX="8px"
                  >
                    {artist.genre.slice(0, 2).map(
                      // eslint-disable-next-line max-len
                      (genre, i, a) => `${genre.tag.toLowerCase()}${i !== a.length - 1 ? ', ' : ''}`,
                    )}
                  </Subtitle>
                </Box>
              </Box>
            );
          })}
        </MotionBox>
      </AnimatePresence>
      <PaginationDots
        activeIndex={activeIndex}
        array={artists}
        colLength={length}
        setActiveIndex={setActiveIndex}
      />
    </Box>
  );
};

export default SimilarArtistsCards;
