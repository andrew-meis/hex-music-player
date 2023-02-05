import { Box, Typography } from '@mui/material';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { usePrevious } from 'react-use';
import {
  MotionBox, MotionSvg, MotionTypography,
} from 'components/motion-components/motion-components';
import { iconMotion, tracklistMotion } from 'components/motion-components/motion-variants';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import TrackHighlights from 'components/track-highlights/TrackHighlights';
import { thresholds } from 'routes/artist/Header';
import { PlayActions } from 'types/enums';
import { SimilarArtistContext } from './SimilarArtists';

interface CollapseContentProps {
  context: SimilarArtistContext;
}

const CollapseContent = ({ context }: CollapseContentProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const { ref, entry } = useInView({ threshold: thresholds });
  const {
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    playSwitch,
  } = context;
  const difference = prevIndex ? activeIndex - prevIndex : 1;

  const handlePlay = () => playSwitch(
    PlayActions.PLAY_ARTIST,
    { artist: openArtistQuery.data?.artist, shuffle: false },
  );
  const handleShuffle = () => playSwitch(
    PlayActions.PLAY_ARTIST,
    { artist: openArtistQuery.data?.artist, shuffle: true },
  );
  const handleRadio = () => playSwitch(
    PlayActions.PLAY_ARTIST_RADIO,
    { artist: openArtistQuery.data?.artist },
  );

  return (
    <Box
      alignContent="flex-start"
      display="flex"
      flexWrap="wrap"
      height={1}
      margin="auto"
      width="calc(100% - 36px)"
    >
      <Box
        position="absolute"
        right={18}
        top={8}
      >
        <PlayShuffleButton
          handlePlay={handlePlay}
          handleRadio={handleRadio}
          handleShuffle={handleShuffle}
        />
      </Box>
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        pt="6px"
        width={1}
      >
        <MotionTypography
          color="text.primary"
          fontFamily="TT Commons"
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
      </Box>
      <Typography color="text.primary" fontFamily="TT Commons" fontSize="1.3rem" width={1}>
        Top Tracks
      </Typography>
      <Box
        display="flex"
        flex="1 1 600px"
        overflow="hidden"
        ref={ref}
      >
        {
          entry && entry.intersectionRatio > 0.3
            ? (
              <AnimatePresence custom={difference} initial={false} mode="wait">
                <MotionBox
                  animate={{ x: 0, opacity: 1 }}
                  custom={difference}
                  exit="exit"
                  initial="enter"
                  key={activeIndex}
                  transition={{ duration: 0.2 }}
                  variants={tracklistMotion}
                >
                  <TrackHighlights
                    activeIndex={activeIndex}
                    context={context}
                    tracks={openArtistTracksQuery.data!}
                  />
                </MotionBox>
              </AnimatePresence>
            )
            : (
              <Box height={224} width={1} />
            )
        }
      </Box>
      <AnimateSharedLayout>
        <Box
          alignItems="center"
          display="flex"
          flex="1 1 600px"
          height={32}
          justifyContent="center"
        >
          {openArtistTracksQuery.data!.map((track, index, array) => {
            if (array.length <= 4) return null;
            if (index % 4 !== 0) return null;
            return (
              <Box
                key={track.id}
                paddingX="12px"
                sx={{ cursor: 'pointer' }}
                onClick={() => setActiveIndex(index / 4)}
              >
                <Box
                  bgcolor="action.disabled"
                  borderRadius="50%"
                  height={8}
                  width={8}
                >
                  {(index / 4) === activeIndex && (
                    <MotionBox
                      layoutId="highlight"
                      sx={{
                        backgroundColor: 'text.secondary',
                        borderRadius: '50%',
                        height: 12,
                        width: 12,
                        position: 'relative',
                        top: '-2px',
                        left: '-2px',
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </AnimateSharedLayout>
    </Box>
  );
};

export default CollapseContent;
