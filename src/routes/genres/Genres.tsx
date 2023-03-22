import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Genre, Library } from 'hex-plex';
import { countBy, throttle } from 'lodash';
import React, { useMemo, useRef } from 'react';
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
} from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { VIEW_PADDING } from 'constants/measures';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtists } from 'queries/artist-queries';
import { filterOptionsQueryFn } from 'queries/library-query-fns';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { IConfig } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

export interface Measurements {
  IMAGE_SIZE: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

export interface GenresContext {
  config: IConfig;
  grid: { cols: number };
  library: Library;
  measurements: Measurements;
  navigate: NavigateFunction;
  width: number;
}

export interface GenreWithWidth extends Genre {
  width: number;
}

const getCols = (width: number) => {
  if (width >= 1350) {
    return 6;
  }
  if (width < 1350 && width >= 1100) {
    return 5;
  }
  if (width < 1100 && width >= 850) {
    return 4;
  }
  if (width < 850 && width >= 650) {
    return 3;
  }
  if (width < 650) {
    return 2;
  }
  return 4;
};

export interface RowProps {
  context: GenresContext;
  index: number;
  genres: GenreWithWidth[];
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Genres = () => {
  const { data: config } = useConfig();
  const library = useLibrary();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const { data: artists } = useArtists({ config, library });
  const { data: artistGenres } = useQuery(
    ['genre', 'Artist'],
    () => filterOptionsQueryFn({
      config,
      field: 'genre',
      library,
      type: 8,
    }),
    {
      initialData: [],
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
  const { width } = useOutletContext() as { width: number };

  const genreCounts = useMemo(() => {
    if (!artists) return {};
    const valueArray = artists.map((artist) => artist.genre.map((genre) => genre.tag)).flat();
    return countBy(valueArray);
  }, [artists]);

  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const rows = useMemo(() => {
    if (!artists || !artistGenres || !genreCounts) return [];
    const arrays: GenreWithWidth[][] = [];
    const genresToSort = structuredClone(artistGenres) as Genre[];
    let newArray: GenreWithWidth[] = [];
    let widthCount = 0;
    while (genresToSort.length > -1) {
      const genreToSort = genresToSort.shift() as GenreWithWidth;
      if (!genreToSort) {
        arrays.push(newArray);
        newArray = [];
        widthCount = 0;
        break;
      }
      const tagCount = genreCounts[genreToSort.title] || 0;
      genreToSort.width = (tagCount / artists.length > 0.02 ? 2 : 1);
      newArray.push(genreToSort);
      widthCount += genreToSort.width;
      if (widthCount === grid.cols) {
        arrays.push(newArray);
        newArray = [];
        widthCount = 0;
      }
      if (widthCount > grid.cols) {
        newArray[newArray.length - 1].width = 1;
        arrays.push(newArray);
        newArray = [];
        widthCount = 0;
      }
    }
    return arrays;
  }, [artistGenres, artists, genreCounts, grid.cols]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem('genres');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'genres',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / grid.cols) - (((grid.cols - 1) * 8) / grid.cols)),
    ROW_HEIGHT:
      Math.floor(((width - VIEW_PADDING) / grid.cols) - (((grid.cols - 1) * 8) / grid.cols)),
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / grid.cols)) * grid.cols,
  }), [grid, width]);

  const genresContext = useMemo(() => ({
    config,
    grid,
    library,
    measurements,
    navigate,
    width,
  }), [
    config,
    grid,
    library,
    measurements,
    navigate,
    width,
  ]);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
      onAnimationComplete={() => virtuoso.current
        ?.scrollTo({ top: initialScrollTop })}
    >
      <Virtuoso
        className="scroll-container"
        components={{
          Footer: FooterWide,
          Header,
        }}
        context={genresContext}
        data={rows}
        itemContent={(index, item, context) => RowContent({ context, index, genres: item })}
        ref={virtuoso}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
        onScroll={(e) => {
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            'genres',
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default Genres;
