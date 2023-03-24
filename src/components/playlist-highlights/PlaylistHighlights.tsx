import { AnimatePresence } from 'framer-motion';
import { Playlist, Library } from 'hex-plex';
import { useMemo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import { VIEW_PADDING } from 'constants/measures';
import PlaylistCard from './PlaylistCard';

interface PlaylistHighlightsProps {
  cols: number;
  library: Library;
  navigate: NavigateFunction;
  playlists: Playlist[];
  width: number;
}

const PlaylistHighlights = ({
  cols, library, navigate, playlists, width,
}: PlaylistHighlightsProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const playlistPage = playlists
    .slice((activeIndex * cols), (activeIndex * cols + cols));
  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
    ROW_HEIGHT: Math.floor((width - VIEW_PADDING) / cols) + 54,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
  }), [cols, width]);

  return (
    <>
      <AnimatePresence custom={difference} initial={false} mode="wait">
        <MotionBox
          animate={{ x: 0, opacity: 1 }}
          custom={difference}
          display="flex"
          exit="exit"
          gap="8px"
          height={measurements.ROW_HEIGHT}
          initial="enter"
          key={activeIndex}
          transition={{ duration: 0.2 }}
          variants={tracklistMotion}
        >
          {playlistPage.map((playlist) => (
            <PlaylistCard
              handleContextMenu={() => {}}
              key={playlist.id}
              library={library}
              measurements={measurements}
              menuTarget={[]}
              navigate={navigate}
              playlist={playlist}
            />
          ))}
        </MotionBox>
      </AnimatePresence>
      <PaginationDots
        activeIndex={activeIndex}
        array={playlists}
        colLength={cols}
        setActiveIndex={setActiveIndex}
      />
    </>
  );
};

export default PlaylistHighlights;
