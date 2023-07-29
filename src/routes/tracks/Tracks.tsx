import { useInfiniteQuery } from '@tanstack/react-query';
import { SortingState } from '@tanstack/react-table';
import { motion } from 'framer-motion';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import ky from 'ky';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { useDebounce } from 'react-use';
import { ListRange } from 'react-virtuoso';
import { Track, parseTrackContainer } from 'api/index';
import { PlexSort } from 'classes';
import usePlayback from 'hooks/usePlayback';
import { configAtom, libraryAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';
import { AppTrackViewSettings } from 'types/interfaces';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import { Filter, filtersAtom } from 'ui/sidebars/filter-panel/FilterPanel';
import { limitAtom } from 'ui/sidebars/filter-panel/InputLimit';
import Header from './Header';
import Subheader from './Subheader';
import TrackTable from './TrackTable';

export const trackSortingAtom = atom<SortingState>([{
  desc: false,
  id: 'grandparentTitle',
}]);

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

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: true,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    ratingCount: false,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const Tracks = () => {
  const config = useAtomValue(configAtom);
  const fetchTimeout = useRef(0);
  const filters = useAtomValue(filtersAtom);
  const library = useAtomValue(libraryAtom);
  const limit = useAtomValue(limitAtom);
  const location = useLocation();
  const navigationType = useNavigationType();
  const range = useRef<ListRange>();
  const setTableKey = useSetAtom(tableKeyAtom);
  const viewSettings = window.electron.readConfig('tracks-view-settings') as AppTrackViewSettings;
  const [containerStart, setContainerStart] = useState(0);
  const [filter, setFilter] = useState('');
  const [filterDebounced, setFilterDebounced] = useState('');
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const [sorting, setSorting] = useAtom(trackSortingAtom);
  const { playUri } = usePlayback();

  useDebounce(() => {
    setFilterDebounced(filter);
  }, 500, [filter]);

  useEffect(() => {
    setTableKey('tracks');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const params = useMemo(() => {
    const newParams = new URLSearchParams();
    newParams.append('type', 10 as unknown as string);
    addFiltersToParams(filters, newParams);
    if (filterDebounced) {
      newParams.append('push', Number(1).toString());
      newParams.append('artist.title', filterDebounced);
      newParams.append('or', Number(1).toString());
      newParams.append('album.title', filterDebounced);
      newParams.append('or', Number(1).toString());
      newParams.append('track.title', filterDebounced);
      newParams.append('pop', Number(1).toString());
    }
    if (!isEmpty(sorting)) {
      const sortString = sorting
        .map((columnSort) => {
          if (columnSort.id === 'originalTitle') {
            const artistSortString = `artist.titleSort:${columnSort.desc ? 'desc' : 'asc'}`;
            return [artistSortString, PlexSort.parseColumnSort(columnSort, 'track').stringify()]
              .join(',');
          }
          return PlexSort.parseColumnSort(columnSort, 'track').stringify();
        })
        .join(',');
      newParams.append('sort', sortString);
    }
    if (limit) {
      newParams.append('limit', limit);
    }
    return newParams;
  }, [filterDebounced, filters, limit, sorting]);

  const fetchTracks = useCallback(async ({ pageParam = 0 }) => {
    params.set('X-Plex-Container-Start', `${pageParam}`);
    params.set('X-Plex-Container-Size', `${containerSize}`);
    const url = [
      library.api.uri,
      `/library/sections/${config.sectionId!}/all?${params.toString()}`,
      `&X-Plex-Token=${library.api.headers()['X-Plex-Token']}`,
    ].join('');
    const newResponse = await ky(url).json() as Record<string, any>;
    const container = parseTrackContainer(newResponse);
    return container;
  }, [config.sectionId, library.api, params]);

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QueryKeys.ALL_TRACKS, filterDebounced, filters, limit, sorting],
    queryFn: fetchTracks,
    getNextPageParam: () => containerStart,
    keepPreviousData: true,
    refetchOnMount: true,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data
      || data.pageParams.includes(containerStart)
      || (containerStart === 0 && range.current?.startIndex === 0)) return;
    fetchNextPage({ pageParam: containerStart });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [containerStart, data]);

  const flatTracks = useMemo(() => {
    if (!data) return [];
    const array = Array(data.pages[0].totalSize).fill(null);
    data.pages.forEach((page) => {
      array.splice(page.offset, page.tracks.length, ...page.tracks);
    });
    return array as Track[];
  }, [data]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      clearTimeout(fetchTimeout.current);
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
      fetchTimeout.current = window.setTimeout(() => {
        if (!data || !range.current) return;
        let value = roundDown(range.current.endIndex);
        if (roundDown(range.current.startIndex) !== roundDown(range.current.endIndex)) {
          if (!data.pageParams.includes(roundDown(range.current.startIndex))) {
            value = roundDown(range.current.startIndex);
          }
          if (data.pageParams.length === 1) {
            value = roundDown(range.current.endIndex);
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
    top = sessionStorage.getItem('tracks-scroll');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'tracks-scroll',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const uri = useMemo(() => (
    `/library/sections/${config.sectionId}/all?${params.toString()}`
  ), [config.sectionId, params]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
  ) => {
    playUri(uri, shuffle, key);
  }, [playUri, uri]);

  if (isLoading || !data) return null;

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scroll-container"
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      ref={setScrollRef}
      style={{ height: '100%', overflow: 'overlay' }}
      onAnimationComplete={() => scrollRef?.scrollTo({ top: initialScrollTop })}
      onScroll={(e) => {
        const target = e.currentTarget as unknown as HTMLDivElement;
        sessionStorage.setItem(
          'tracks-scroll',
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        handlePlayNow={handlePlayNow}
      />
      <Subheader
        count={flatTracks.length}
        filter={filter}
        setFilter={setFilter}
      />
      <TrackTable
        columnOptions={
          typeof viewSettings !== 'undefined'
            ? viewSettings.columns
            : defaultViewSettings.columns
        }
        isScrollingFn={handleScrollState}
        isViewCompact={
          typeof viewSettings !== 'undefined'
            ? viewSettings.compact
            : defaultViewSettings.compact
        }
        library={library}
        listRange={range}
        multiLineRating={
          typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineRating
            : defaultViewSettings.multiLineRating
        }
        playbackFn={handlePlayNow}
        rows={flatTracks}
        scrollRef={scrollRef}
        setSorting={setSorting}
        sorting={sorting}
        subtextOptions={{
          albumTitle: true,
          artistTitle: true,
          showSubtext: typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineTitle
            : defaultViewSettings.multiLineTitle,
        }}
      />
    </motion.div>
  );
};

export default Tracks;
