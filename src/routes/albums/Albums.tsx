import { useMenuState } from '@szhsin/react-menu';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ky from 'ky';
import { throttle } from 'lodash';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
} from 'react-router-dom';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Album, Library, parseAlbumContainer } from 'api/index';
import { PlexSort } from 'classes';
import { AlbumMenu } from 'components/menus';
import { VIEW_PADDING } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useConfig, useLibrary, useSettings } from 'queries/app-queries';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumns } from 'scripts/get-columns';
import { QueryKeys } from 'types/enums';
import { AppConfig, AppSettings, CardMeasurements } from 'types/interfaces';
import { Filter } from 'ui/sidebars/filter-panel/FilterPanel';
import Header from './Header';
import Row from './Row';
import ScrollSeekPlaceholder from './ScrollSeekPlaceholder';
import ScrollSeekPlaceholderNoText from './ScrollSeekPlaceholderNoText';

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

const addFiltersToParams = (filters: Filter[], params: URLSearchParams) => {
  filters.forEach((filter) => params
    .append(
      // @ts-ignore
      `${filter.group.toLowerCase()}.${filter.field}${operatorMap[filter.type][filter.operator]}`,
      `${filter.value}`,
    ));
};

const roundDown = (x: number) => Math.floor(x / containerSize) * containerSize;

export interface AlbumsContext {
  config: AppConfig;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Album[];
  navigate: NavigateFunction;
  playUri: (uri: string, shuffle?: boolean, key?: string) => Promise<void>;
  settings: AppSettings;
  sort: PlexSort;
  uri: string;
}

export interface RowProps {
  context: AlbumsContext;
  index: number;
  albums: Album[];
}

const RowContent = (props: RowProps) => <Row {...props} />;

const defaultSort = 'artist.titleSort:asc';

const Albums = () => {
  const fetchTimeout = useRef(0);
  const filters = useQuery(
    [QueryKeys.FILTERS],
    () => ([]),
    {
      initialData: [] as Filter[],
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const limit = useQuery(
    [QueryKeys.LIMIT],
    () => (''),
    {
      initialData: '',
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );
  const location = useLocation();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const range = useRef<ListRange>();
  const scrollCount = useRef(0);
  const sort = useQuery(
    [QueryKeys.SORT_ALBUMS],
    () => PlexSort.parse(defaultSort),
    {
      initialData: PlexSort.parse(defaultSort),
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [containerStart, setContainerStart] = useState(0);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const [menuTarget, setMenuTarget] = useState<Album[]>([]);
  const { data: config } = useConfig();
  const { data: settings } = useSettings();
  const { playSwitch, playUri } = usePlayback();
  const { width } = useOutletContext() as { width: number };

  const params = useMemo(() => {
    const newParams = new URLSearchParams();
    newParams.append('type', 9 as unknown as string);
    addFiltersToParams(filters.data, newParams);
    if (sort.data) {
      newParams.append('sort', sort.data.stringify());
    }
    if (limit.data) {
      newParams.append('limit', limit.data);
    }
    return newParams;
  }, [filters.data, limit.data, sort.data]);

  const fetchAlbums = useCallback(async ({ pageParam = 0 }) => {
    params.append('X-Plex-Container-Start', `${pageParam}`);
    params.append('X-Plex-Container-Size', `${containerSize}`);
    const url = [
      library.api.uri,
      `/library/sections/${config.sectionId!}/all?${params.toString()}`,
      `&X-Plex-Token=${library.api.headers()['X-Plex-Token']}`,
    ].join('');
    const newResponse = await ky(url).json() as Record<string, any>;
    const container = parseAlbumContainer(newResponse);
    return container;
  }, [config.sectionId, library.api, params]);

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QueryKeys.ALL_ALBUMS, filters.data, limit.data, sort.data],
    queryFn: fetchAlbums,
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

  const flatAlbums = useMemo(() => {
    if (!data) return [];
    const array = Array(data.pages[0].totalSize).fill(null);
    data.pages.forEach((page) => {
      array.splice(page.offset, page.albums.length, ...page.albums);
    });
    return array as Album[];
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
    setMenuTarget(flatAlbums.filter((album) => album).filter((album) => album.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [flatAlbums, toggleMenu]);

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
    top = sessionStorage.getItem('albums-scroll');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'albums-scroll',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / grid.cols) - (((grid.cols - 1) * 8) / grid.cols)),
    ROW_HEIGHT: Math.floor((width - VIEW_PADDING) / grid.cols) + (settings.albumText ? 54 : 0),
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / grid.cols)) * grid.cols,
  }), [grid.cols, settings.albumText, width]);

  const uri = useMemo(() => (
    `/library/sections/${config.sectionId}/all?${params.toString()}`
  ), [config.sectionId, params]);

  const albumsContext = useMemo(() => ({
    config,
    grid,
    handleContextMenu,
    hoverIndex,
    library,
    measurements,
    menuTarget,
    navigate,
    playUri,
    settings,
    sort: sort.data,
    uri,
  }), [
    config,
    grid,
    handleContextMenu,
    hoverIndex,
    library,
    measurements,
    menuTarget,
    navigate,
    playUri,
    settings,
    sort.data,
    uri,
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
            ScrollSeekPlaceholder: settings.albumText
              ? ScrollSeekPlaceholder
              : ScrollSeekPlaceholderNoText,
          }}
          context={albumsContext}
          fixedItemHeight={measurements.ROW_HEIGHT}
          isScrolling={handleScrollState}
          itemContent={(index, _item, context) => {
            const startIndex = index * grid.cols;
            const albums = flatAlbums
              .slice(startIndex, startIndex + grid.cols).filter((album) => album);
            if (albums.length === grid.cols || (startIndex + grid.cols > data.pages[0].totalSize)) {
              return RowContent({ context, index, albums });
            }
            return (
              <>
                {settings.albumText
                  ? <ScrollSeekPlaceholder context={albumsContext} />
                  : <ScrollSeekPlaceholderNoText context={albumsContext} />}
              </>
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
              'albums-scroll',
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
      <AlbumMenu
        albums={menuTarget}
        anchorPoint={anchorPoint}
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

export default Albums;
