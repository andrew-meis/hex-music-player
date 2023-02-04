import { Box, Typography } from '@mui/material';
import { AnimateSharedLayout } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import { Link } from 'react-router-dom';
import {
  MotionBox, MotionSvg, MotionTypography,
} from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import TrackHighlights from 'components/track-highlights/TrackHighlights';
import { ArtistsContext } from './Artists';

interface CollapseContentProps {
  context: ArtistsContext;
}

const CollapseContent = ({ context }: CollapseContentProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const {
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
  } = context;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: activeIndex * scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
  }, [activeIndex]);

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
        ref={scrollRef}
      >
        <TrackHighlights
          context={context}
          tracks={openArtistTracksQuery.data!}
        />
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
