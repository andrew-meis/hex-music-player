import { useMenuState } from '@szhsin/react-menu';
import { UseQueryResult } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
  NavigateFunction, useLocation, useNavigate, useNavigationType, useOutletContext,
} from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Album, Artist, Hub, Library, PlayQueueItem, Track } from 'api/index';
import ArtistMenu from 'components/menus/ArtistMenu';
import { VIEW_PADDING } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtist, useArtists, useArtistTracks } from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumns } from 'scripts/get-columns';
import { PlayActions, PlexSortKeys, SortOrders } from 'types/enums';
import { AppConfig, CardMeasurements } from 'types/interfaces';
import Header from './Header';
import Row from './Row';
import ScrollSeekPlaceholder from './ScrollSeekPlaceholder';

type OpenArtist = Pick<Artist, 'id' | 'guid' | 'title'>;

export interface ArtistsContext {
  config: AppConfig;
  getFormattedTime: (inMs: number) => string;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  height: number;
  isPlaying: boolean;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Artist[];
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  open: boolean;
  openArtist: OpenArtist;
  openArtistQuery: UseQueryResult<{albums: Album[], artist: Artist, hubs: Hub[]}>,
  openArtistTracksQuery: UseQueryResult<Track[]>;
  openCard: {row: number, index: number};
  panelContent: 'tracks' | 'albums';
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  playUri: (uri: string, shuffle?: boolean, key?: string) => Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenArtist: React.Dispatch<React.SetStateAction<OpenArtist>>;
  setOpenCard: React.Dispatch<React.SetStateAction<{row: number, index: number}>>;
  setPanelContent: React.Dispatch<React.SetStateAction<'tracks' | 'albums'>>;
  virtuoso: React.RefObject<VirtuosoHandle>;
  width: number;
  uri: string;
}

export interface RowProps {
  context: ArtistsContext;
  index: number;
  artists: Artist[];
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Artists = () => {
  const library = useLibrary();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const scrollCount = useRef(0);
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const [open, setOpen] = useState(false);
  const [openArtist, setOpenArtist] = useState<OpenArtist>({ id: -1, title: '', guid: '' });
  const [openCard, setOpenCard] = useState({ row: -1, index: -1 });
  const [panelContent, setPanelContent] = useState<'tracks' | 'albums'>('tracks');
  const { data: config } = useConfig();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { playSwitch, playUri } = usePlayback();
  const { getFormattedTime } = useFormattedTime();
  const { height, width } = useOutletContext() as { height: number, width: number };

  const { data: artists, isLoading } = useArtists({ config, library });
  const openArtistQuery = useArtist(openArtist.id, library);
  const openArtistTracksQuery = useArtistTracks({
    config,
    library,
    id: openArtist.id,
    title: openArtist.title,
    guid: openArtist.guid,
    sort: [
      PlexSortKeys.PLAYCOUNT,
      SortOrders.DESC,
    ].join(''),
    slice: 12,
  });

  // create array for virtualization
  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const items = useMemo(() => {
    if (!artists) {
      return [];
    }
    const rows: Artist[][] = [];
    for (let i = 0; i < artists.length; i += grid.cols) {
      const row = artists.slice(i, i + grid.cols) as Artist[];
      rows.push(row);
    }
    return rows;
  }, [artists, grid]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!artists) return;
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(artists.filter((artist) => artist).filter((artist) => artist.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [artists, toggleMenu]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem('artists');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'artists',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / grid.cols) - (((grid.cols - 1) * 8) / grid.cols)),
    ROW_HEIGHT: Math.floor(((width - VIEW_PADDING) / grid.cols) * 0.70) + 54,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / grid.cols)) * grid.cols,
  }), [grid, width]);

  const uri = useMemo(() => {
    const uriParams = {
      type: 8,
    };
    // eslint-disable-next-line max-len
    return `/library/sections/${config.sectionId}/all?${new URLSearchParams(uriParams as any).toString()}`;
  }, [config.sectionId]);

  const artistsContext = useMemo(() => ({
    config,
    getFormattedTime,
    grid,
    handleContextMenu,
    height,
    isPlaying,
    library,
    measurements,
    menuTarget,
    navigate,
    nowPlaying,
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    panelContent,
    playSwitch,
    playUri,
    setOpen,
    setOpenArtist,
    setOpenCard,
    setPanelContent,
    uri,
    virtuoso,
    width,
  }), [
    config,
    getFormattedTime,
    grid,
    handleContextMenu,
    height,
    isPlaying,
    library,
    measurements,
    menuTarget,
    navigate,
    nowPlaying,
    open,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    openCard,
    panelContent,
    playSwitch,
    playUri,
    setOpen,
    setOpenArtist,
    setOpenCard,
    setPanelContent,
    uri,
    virtuoso,
    width,
  ]);

  if (isLoading || !artists) return null;

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
            ScrollSeekPlaceholder,
          }}
          context={artistsContext}
          data={items}
          itemContent={(index, item, context) => RowContent({ context, index, artists: item })}
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
              'artists',
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
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

export default Artists;
