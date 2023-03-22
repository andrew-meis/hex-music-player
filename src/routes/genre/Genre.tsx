import { Box } from '@mui/material';
import { motion } from 'framer-motion';
import { throttle } from 'lodash';
import { useMemo, useRef } from 'react';
import { useLocation, useNavigationType, useOutletContext, useParams } from 'react-router-dom';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtistsByGenre } from 'queries/artist-queries';
import { LocationWithState, RouteParams } from 'types/interfaces';
import Banner from './Banner';

const getCols = (width: number) => {
  if (width >= 1350) {
    return 7;
  }
  if (width < 1350 && width >= 1100) {
    return 6;
  }
  if (width < 1100 && width >= 850) {
    return 5;
  }
  if (width < 850 && width >= 650) {
    return 4;
  }
  if (width < 650) {
    return 3;
  }
  return 5;
};

const Genre = () => {
  const box = useRef<HTMLDivElement>(null);
  const config = useConfig();
  const library = useLibrary();
  const location = useLocation() as LocationWithState;
  const navigationType = useNavigationType();
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const { data: artists, isLoading } = useArtistsByGenre({
    fastKey: `/library/sections/${config.data.sectionId}/all?genre=${id}`,
    library,
  });
  const { width } = useOutletContext() as { width: number };

  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`genre-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `genre-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  if (!artists || isLoading) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
      onAnimationComplete={() => box.current
        ?.scrollTo({ top: initialScrollTop })}
    >
      <Box
        className="scroll-container"
        height={1}
        ref={box}
        sx={{
          overflowX: 'hidden',
          overflowY: 'overlay',
        }}
        onScroll={(e) => {
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            `genre-scroll ${id}`,
            target.scrollTop as unknown as string,
          );
        }}
      >
        <Box
          maxWidth="1600px"
          mb="1px"
          mx="auto"
        >
          <Banner
            cols={grid.cols}
            library={library}
            srcs={artists.map((artist) => artist.thumb).filter((el) => el).slice(0, grid.cols)}
            title={location.state.title}
            width={width}
          />
        </Box>
        <Box height={1000} />
      </Box>
    </motion.div>
  );
};

export default Genre;
