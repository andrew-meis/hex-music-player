import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Album, Artist, Hub, Library, PlayQueueItem, Track } from 'hex-plex';
import { throttle } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import {
  NavigateFunction, useLocation, useNavigate, useNavigationType, useOutletContext,
} from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtist, useArtistTracks } from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import { PlayActions, PlexSortKeys, QueryKeys, SortOrders } from 'types/enums';
import { IConfig } from 'types/interfaces';
import Header from './Header';
import Row from './Row';
import ScrollSeekPlaceholder from './ScrollSeekPlaceholder';

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

export interface OpenArtist {
  id: number;
  guid: string;
  title: string;
}

export interface ArtistsContext {
  config: IConfig;
  getFormattedTime: (inMs: number) => string;
  grid: { cols: number };
  isPlaying: boolean;
  library: Library;
  measurements: Measurements;
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
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [open, setOpen] = useState(false);
  const [openArtist, setOpenArtist] = useState<OpenArtist>({ id: -1, title: '', guid: '' });
  const [openCard, setOpenCard] = useState({ row: -1, index: -1 });
  const [panelContent, setPanelContent] = useState<'tracks' | 'albums'>('tracks');
  const { data: config } = useConfig();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { playSwitch, playUri } = usePlayback();
  const { getFormattedTime } = useFormattedTime();
  const { width } = useOutletContext() as { width: number, height: number };

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

  const { data: artists, isLoading } = useQuery(
    [QueryKeys.ARTISTS],
    async () => library.artists(config.sectionId!, { sort: 'titleSort:asc' }),
    {
      enabled: !!config && !!library,
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      select: (data) => data.artists,
    },
  );

  // create array for virtualization
  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
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

  const initialScrollTop = () => {
    let top;
    top = sessionStorage.getItem('artists');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

  const measurements = useMemo(() => ({
    IMAGE_HEIGHT: Math.floor(((width * 0.89) / grid.cols) * 0.70),
    IMAGE_WIDTH: Math.floor((width * 0.89) / grid.cols),
    ROW_HEIGHT: Math.floor(((width * 0.89) / grid.cols) * 0.70) + 28,
    ROW_WIDTH: (Math.floor((width * 0.89) / grid.cols)) * grid.cols,
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
    isPlaying,
    library,
    measurements,
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
    isPlaying,
    library,
    measurements,
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
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
    >
      <Virtuoso
        className="scroll-container"
        components={{
          Footer,
          Header,
          ScrollSeekPlaceholder,
        }}
        context={artistsContext}
        data={items}
        fixedItemHeight={measurements.ROW_HEIGHT}
        initialScrollTop={initialScrollTop()}
        itemContent={(index, item, context) => RowContent({ context, index, artists: item })}
        ref={virtuoso}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 500,
          exit: (velocity) => Math.abs(velocity) < 100,
        }}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
        onScroll={(e) => {
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            'artists',
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default Artists;
