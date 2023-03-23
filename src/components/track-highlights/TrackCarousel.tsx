import { AnimatePresence } from 'framer-motion';
import { Library, Track } from 'hex-plex';
import { useMemo, useState } from 'react';
import { usePrevious } from 'react-use';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import TrackHighlights from './TrackHighlights';

interface TrackCarouselProps {
  tracks: Track[];
  library: Library;
}

const TrackCarousel = ({
  tracks, library,
}: TrackCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch } = usePlayback();

  const prevIndex = usePrevious(activeIndex);
  const difference = prevIndex ? activeIndex - prevIndex : 1;

  const context = useMemo(() => ({
    getFormattedTime,
    isPlaying,
    library,
    nowPlaying,
    playSwitch,
  }), [getFormattedTime, isPlaying, library, nowPlaying, playSwitch]);

  return (
    <>
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
            tracks={tracks}
          />
        </MotionBox>
      </AnimatePresence>
      <PaginationDots
        activeIndex={activeIndex}
        array={tracks}
        colLength={4}
        setActiveIndex={setActiveIndex}
      />
    </>
  );
};

export default TrackCarousel;
