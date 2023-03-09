import { motion } from 'framer-motion';
import { Library, Playlist, PlayQueueItem } from 'hex-plex';
import { throttle } from 'lodash';
import React, { useMemo, useRef } from 'react';
import {
  NavigateFunction, useLocation, useNavigate, useNavigationType, useOutletContext,
} from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { VIEW_PADDING } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { usePlaylists } from 'queries/playlist-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import { PlayActions } from 'types/enums';
import { IConfig } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

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

export interface Measurements {
  IMAGE_HEIGHT: number;
  IMAGE_WIDTH: number;
  ROW_HEIGHT: number;
  ROW_WIDTH: number;
}

export interface PlaylistsContext {
  config: IConfig;
  isPlaying: boolean;
  library: Library;
  measurements: Measurements;
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
}

export interface RowProps {
  context: PlaylistsContext;
  index: number;
  playlists: Playlist[];
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Playlists = () => {
  const library = useLibrary();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const scrollCount = useRef(0);
  const virtuoso = useRef<VirtuosoHandle>(null);
  const { data: config } = useConfig();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { playSwitch } = usePlayback();
  const { getFormattedTime } = useFormattedTime();
  const { data: playlists, isLoading } = usePlaylists(library);
  const { width } = useOutletContext() as { width: number };

  // create array for virtualization
  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const items = useMemo(() => {
    if (!playlists) {
      return [];
    }
    const rows: Playlist[][] = [];
    for (let i = 0; i < playlists.length; i += grid.cols) {
      const row = playlists.slice(i, i + grid.cols) as Playlist[];
      rows.push(row);
    }
    return rows;
  }, [playlists, grid]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem('playlists');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'playlists',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const measurements = useMemo(() => ({
    IMAGE_HEIGHT: Math.floor((width - VIEW_PADDING) / grid.cols),
    IMAGE_WIDTH: Math.floor((width - VIEW_PADDING) / grid.cols),
    ROW_HEIGHT: Math.floor((width - VIEW_PADDING) / grid.cols) + 28,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / grid.cols)) * grid.cols,
  }), [grid, width]);

  const artistsContext = useMemo(() => ({
    config,
    getFormattedTime,
    isPlaying,
    library,
    measurements,
    navigate,
    nowPlaying,
    playSwitch,
  }), [
    config,
    getFormattedTime,
    isPlaying,
    library,
    measurements,
    navigate,
    nowPlaying,
    playSwitch,
  ]);

  if (isLoading || !playlists) return null;

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
          Footer,
          Header,
        }}
        context={artistsContext}
        data={items}
        itemContent={(index, item, context) => RowContent({ context, index, playlists: item })}
        ref={virtuoso}
        scrollSeekConfiguration={{
          enter: (velocity) => {
            if (scrollCount.current < 10) return false;
            return Math.abs(velocity) > 500;
          },
          exit: (velocity) => Math.abs(velocity) < 100,
        }}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
        onScroll={(e) => {
          if (scrollCount.current < 10) scrollCount.current += 1;
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            'playlists',
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default Playlists;
