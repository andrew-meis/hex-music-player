import { useMenuState } from '@szhsin/react-menu';
import { UseQueryResult, useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ky from 'ky';
import { throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NavigateFunction, useLocation, useNavigate, useNavigationType, useOutletContext,
} from 'react-router-dom';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import {
  Album, Artist, Hub, Library, PlayQueueItem, Track, parseArtistContainer,
} from 'api/index';
import { PlexSort, plexSort } from 'classes';
import ArtistMenu from 'components/menus/ArtistMenu';
import { VIEW_PADDING } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useArtist, useArtistTracks } from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumns } from 'scripts/get-columns';
import { PlayActions, QueryKeys, SortOrders, TrackSortKeys } from 'types/enums';
import { AppConfig, CardMeasurements } from 'types/interfaces';
import { FilterObject } from 'ui/sidebars/filter/Filter';
import Header from './Header';
import Row from './Row';
import ScrollSeekPlaceholder from './ScrollSeekPlaceholder';

const containerSize = 100;

const operatorMap = {
  tag: {
    is: '',
    'is not': '!',
  },
  int: {
    is: '',
    'is not': '!',
    'is greater than': '>>',
    'is less than': '<<',
  },
  str: {
    contains: '',
    'does not contain': '!',
    is: '=',
    'is not': '!=',
    'begins with': '<',
    'ends with': '>',
  },
  bool: {
    is: '',
    'is not': '!',
  },
  datetime: {
    'is before': '<<',
    'is after': '>>',
    'is in the last': '>>',
    'is not in the last': '<<',
  },
};

const addFiltersToParams = (filters: FilterObject[], params: URLSearchParams) => {
  filters.forEach((filter) => params
    .append(
      // @ts-ignore
      `${filter.group.toLowerCase()}.${filter.field}${operatorMap[filter.type][filter.operator]}`,
      `${filter.value}`,
    ));
};

const roundDown = (x: number) => Math.floor(x / containerSize) * containerSize;

type OpenArtist = Pick<Artist, 'id' | 'guid' | 'title'>;

export interface ArtistsContext {
  config: AppConfig;
  getFormattedTime: (inMs: number) => string;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
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
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  playUri: (uri: string, shuffle?: boolean, key?: string) => Promise<void>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setOpenArtist: React.Dispatch<React.SetStateAction<OpenArtist>>;
  setOpenCard: React.Dispatch<React.SetStateAction<{row: number, index: number}>>;
  sort: PlexSort;
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

const defaultSort = 'titleSort:asc';

const Artists = () => {
  const fetchTimeout = useRef(0);
  const filters = useQuery(
    [QueryKeys.FILTERS],
    () => ([]),
    {
      initialData: [] as FilterObject[],
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
  const library = useLibrary();
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const range = useRef<ListRange>();
  const scrollCount = useRef(0);
  const sort = useQuery(
    [QueryKeys.SORT_ARTISTS],
    () => PlexSort.parse(defaultSort),
    {
      initialData: PlexSort.parse(defaultSort),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [containerStart, setContainerStart] = useState(0);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const [open, setOpen] = useState(false);
  const [openArtist, setOpenArtist] = useState<OpenArtist>({ id: -1, title: '', guid: '' });
  const [openCard, setOpenCard] = useState({ row: -1, index: -1 });
  const { data: config } = useConfig();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { playSwitch, playUri } = usePlayback();
  const { getFormattedTime } = useFormattedTime();
  const { width } = useOutletContext() as { height: number, width: number };

  const fetchArtists = useCallback(async ({ pageParam = 0 }) => {
    const params = new URLSearchParams();
    params.append('type', 8 as unknown as string);
    params.append('X-Plex-Container-Start', `${pageParam}`);
    params.append('X-Plex-Container-Size', `${containerSize}`);
    addFiltersToParams(filters.data, params);
    if (sort.data) {
      params.append('sort', sort.data.stringify());
    }
    const url = [
      library.api.uri,
      `/library/sections/${config.sectionId!}/all?${params.toString()}`,
      `&X-Plex-Token=${library.api.headers()['X-Plex-Token']}`,
    ].join('');
    const newResponse = await ky(url).json() as Record<string, any>;
    const container = parseArtistContainer(newResponse);
    return container;
  }, [config.sectionId, filters.data, library.api, sort.data]);

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QueryKeys.ALL_ARTISTS, filters.data, sort.data],
    queryFn: fetchArtists,
    getNextPageParam: () => containerStart,
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data
    || data.pageParams.includes(containerStart)
    || (containerStart === 0 && range.current?.startIndex === 0)) return;
    fetchNextPage();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerStart, data]);

  const openArtistQuery = useArtist(openArtist.id, library);
  const openArtistTracksQuery = useArtistTracks({
    config,
    library,
    id: openArtist.id,
    title: openArtist.title,
    guid: openArtist.guid,
    sort: plexSort(TrackSortKeys.PLAYCOUNT, SortOrders.DESC),
    slice: 5,
  });

  const flatArtists = useMemo(() => {
    if (!data) return [];
    const array = Array(data.pages[0].totalSize).fill(null);
    data.pages.forEach((page) => {
      array.splice(page.offset, page.artists.length, ...page.artists);
    });
    return array as Artist[];
  }, [data]);

  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(flatArtists.filter((artist) => artist)
      .filter((artist) => artist.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [flatArtists, toggleMenu]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      clearTimeout(fetchTimeout.current);
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
      fetchTimeout.current = window.setTimeout(() => {
        if (!data || !range.current) return;
        let value = roundDown(range.current.endIndex * grid.cols);
        // eslint-disable-next-line max-len
        if (roundDown(range.current.startIndex * grid.cols) !== roundDown(range.current.endIndex * grid.cols)) {
          if (!data.pageParams.includes(roundDown(range.current.startIndex * grid.cols))) {
            value = roundDown(range.current.startIndex * grid.cols);
          }
          if (data.pageParams.length === 1) {
            value = roundDown(range.current.endIndex * grid.cols);
          }
        }
        if (containerStart !== value) {
          setContainerStart(value);
        }
      }, 200);
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem('artists-scroll');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'artists-scroll',
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
    playSwitch,
    playUri,
    setOpen,
    setOpenArtist,
    setOpenCard,
    sort: sort.data,
    uri,
    virtuoso,
    width,
  }), [
    config,
    getFormattedTime,
    grid,
    handleContextMenu,
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
    playSwitch,
    playUri,
    setOpen,
    setOpenArtist,
    setOpenCard,
    sort.data,
    uri,
    virtuoso,
    width,
  ]);

  if (isLoading || !data) return null;

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
          isScrolling={handleScrollState}
          itemContent={(index, _item, context) => {
            const startIndex = index * grid.cols;
            const artists = flatArtists
              .slice(startIndex, startIndex + grid.cols).filter((album) => album);
            if (artists.length === grid.cols
              || (startIndex + grid.cols > data.pages[0].totalSize)) {
              return RowContent({ context, index, artists });
            }
            return (
              <ScrollSeekPlaceholder context={artistsContext} />
            );
          }}
          rangeChanged={(newRange) => {
            range.current = newRange;
          }}
          ref={virtuoso}
          scrollSeekConfiguration={{
            enter: (velocity) => {
              if (scrollCount.current < 10) return false;
              return Math.abs(velocity) > 500;
            },
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={Math.ceil(data.pages[0].totalSize / grid.cols)}
          onScroll={(e) => {
            if (scrollCount.current < 10) scrollCount.current += 1;
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              'artists-scroll',
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
