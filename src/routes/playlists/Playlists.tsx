import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  NavigateFunction, useLocation, useNavigate, useNavigationType, useOutletContext,
} from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Library, Playlist, PlayQueueItem } from 'api/index';
import PlaylistMenu from 'components/menus/PlaylistMenu';
import { VIEW_PADDING } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { usePlaylists } from 'queries/playlist-queries';
import { useNowPlaying } from 'queries/plex-queries';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumnsWide } from 'scripts/get-columns';
import { PlayActions } from 'types/enums';
import { AppConfig, CardMeasurements } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

export interface PlaylistsContext {
  config: AppConfig;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  isPlaying: boolean;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Playlist[];
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
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const [menuTarget, setMenuTarget] = useState<Playlist[]>([]);
  const { data: config } = useConfig();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { playSwitch } = usePlayback();
  const { getFormattedTime } = useFormattedTime();
  const { data: playlists, isLoading } = usePlaylists(library);
  const { width } = useOutletContext() as { width: number };

  const throttledCols = throttle(() => getColumnsWide(width), 300, { leading: true });
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

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!playlists) return;
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(playlists
      .filter((playlist) => playlist)
      .filter((playlist) => playlist.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [playlists, toggleMenu]);

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
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / grid.cols) - (((grid.cols - 1) * 8) / grid.cols)),
    ROW_HEIGHT: Math.floor((width - VIEW_PADDING) / grid.cols) * 0.33,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / grid.cols)) * grid.cols,
  }), [grid, width]);

  const playlistsContext = useMemo(() => ({
    config,
    getFormattedTime,
    handleContextMenu,
    isPlaying,
    library,
    measurements,
    menuTarget,
    navigate,
    nowPlaying,
    playSwitch,
  }), [
    config,
    getFormattedTime,
    handleContextMenu,
    isPlaying,
    library,
    measurements,
    menuTarget,
    navigate,
    nowPlaying,
    playSwitch,
  ]);

  if (isLoading || !playlists) return null;

  return (
    <>
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
          context={playlistsContext}
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
      <PlaylistMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        playlists={menuTarget}
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

export default Playlists;
