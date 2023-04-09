import { useMenuState } from '@szhsin/react-menu';
import { AnimatePresence } from 'framer-motion';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { Artist, Library } from 'api/index';
import ArtistMenu from 'components/menus/ArtistMenu';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import { VIEW_PADDING } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { ArtistPreview } from 'routes/genre/Genre';
import { getColumns } from 'scripts/get-columns';
import ArtistCard from './ArtistCard';

interface ArtistCarouselProps {
  artists: Artist[] | ArtistPreview[];
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const ArtistCarousel = ({
  artists, library, navigate, width,
}: ArtistCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const { playSwitch } = usePlayback();

  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const { cols } = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const prevIndex = usePrevious(activeIndex);
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  const artistPage = artists
    .slice((activeIndex * cols), (activeIndex * cols + cols));

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(artists
      .filter((artist) => artist).filter((artist) => artist.id === targetId) as Artist[]);
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [artists, toggleMenu]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
    ROW_HEIGHT: Math.floor(((width - VIEW_PADDING) / cols) * 0.70) + 54,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
  }), [cols, width]);

  const handleClick = (artist: Artist | ArtistPreview) => navigate(
    `/artists/${artist.id}`,
    { state: { guid: artist.guid, title: artist.title } },
  );

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
          {artistPage.map((artist) => (
            <ArtistCard
              artist={artist}
              handleContextMenu={handleContextMenu}
              key={artist.id}
              library={library}
              measurements={measurements}
              menuTarget={menuTarget}
              onClick={() => handleClick(artist)}
            />
          ))}
        </MotionBox>
      </AnimatePresence>
      <PaginationDots
        activeIndex={activeIndex}
        array={artists}
        colLength={cols}
        setActiveIndex={setActiveIndex}
      />
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
    </>
  );
};

export default ArtistCarousel;
