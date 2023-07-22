import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useAtomValue } from 'jotai';
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
import { Genre, Library } from 'api/index';
import { VIEW_PADDING } from 'constants/measures';
import { useArtists } from 'queries/artist-queries';
import { filterOptionsQueryFn } from 'queries/library-query-fns';
import { configAtom, libraryAtom } from 'root/Root';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumns } from 'scripts/get-columns';
import { AppConfig } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

export interface Measurements {
  IMAGE_SIZE: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

export interface GenresContext {
  config: AppConfig;
  grid: { cols: number };
  library: Library;
  measurements: Measurements;
  navigate: NavigateFunction;
  width: number;
}

export interface GenreWithWidth extends Genre {
  width: number;
}

export interface RowProps {
  context: GenresContext;
  index: number;
  genres: GenreWithWidth[];
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Genres = () => {
  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const { data: artists } = useArtists({ config, library });
  const { data: genres } = useQuery(
    ['genre', 'Album'],
    () => filterOptionsQueryFn({
      config,
      field: 'genre',
      library,
      type: 9,
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

  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const rows = useMemo(() => {
    if (!artists || !genres || !genreCounts) return [];
    const arrays: GenreWithWidth[][] = [];
    const genresToSort = structuredClone(genres) as Genre[];
    let newArray: GenreWithWidth[] = [];
    let widthCount = 0;
    while (genresToSort.length > -1) {
      const genreToSort = genresToSort.shift() as GenreWithWidth;
      if (!genreToSort) {
        if (newArray.length > 0) arrays.push(newArray);
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
  }, [artists, genreCounts, genres, grid.cols]);

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
