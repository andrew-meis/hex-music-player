import { useInfiniteQuery, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import ky from 'ky';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { ListRange, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Library, PlayQueueItem, Track, parseTrackContainer } from 'api/index';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import ScrollSeekPlaceholderNoIndex from 'routes/virtuoso-components/ScrollSeekPlaceholderNoIndex';
import { QueryKeys } from 'types/enums';
import { AppConfig } from 'types/interfaces';
import { FilterObject } from 'ui/sidebars/filter/Filter';
import Header from './Header';
import List from './List';
import Row from './Row';

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

export interface TracksContext {
  config: AppConfig;
  getFormattedTime: (inMs: number) => string;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  playUri: (uri: string, shuffle?: boolean, key?: string) => Promise<void>;
  tracks: Track[];
  uri: string;
}

export interface RowProps {
  context: TracksContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Tracks = () => {
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
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const location = useLocation();
  const navigationType = useNavigationType();
  const queryClient = useQueryClient();
  const range = useRef<ListRange>();
  const scrollCount = useRef(0);
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [containerStart, setContainerStart] = useState(0);
  const { getFormattedTime } = useFormattedTime();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: config } = useConfig();
  const { playUri } = usePlayback();

  const fetchTracks = async ({ pageParam = 0 }) => {
    const params = new URLSearchParams();
    params.append('type', 10 as unknown as string);
    params.append('X-Plex-Container-Start', `${pageParam}`);
    params.append('X-Plex-Container-Size', `${containerSize}`);
    addFiltersToParams(filters.data, params);
    const url = [
      library.api.uri,
      `/library/sections/${config.sectionId!}/all?${params.toString()}`,
      `&X-Plex-Token=${library.api.headers()['X-Plex-Token']}`,
    ].join('');
    const newResponse = await ky(url).json() as Record<string, any>;
    const container = parseTrackContainer(newResponse);
    return container;
  };

  const { data, fetchNextPage, isLoading } = useInfiniteQuery({
    queryKey: [QueryKeys.ALL_TRACKS, filters.data],
    queryFn: fetchTracks,
    getNextPageParam: () => 0,
    keepPreviousData: true,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!data || data.pageParams.includes(containerStart)) return;
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

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [queryClient]);

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

  const uri = useMemo(() => {
    const uriParams = {
      type: 10,
    };
    // eslint-disable-next-line max-len
    return `/library/sections/${config.sectionId}/all?${new URLSearchParams(uriParams as any).toString()}`;
  }, [config.sectionId]);

  const tracksContext: TracksContext = useMemo(() => ({
    config,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    tracks: flatTracks,
    uri,
  }), [
    config,
    flatTracks,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    uri,
  ]);

  if (isLoading || !data) return null;

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
          List,
          ScrollSeekPlaceholder: ScrollSeekPlaceholderNoIndex,
        }}
        context={tracksContext}
        fixedItemHeight={56}
        increaseViewportBy={168}
        isScrolling={handleScrollState}
        itemContent={(index, _item, context) => {
          const trackContainer = data.pages.find((page) => page.offset === roundDown(index));
          if (trackContainer) {
            const track = trackContainer.tracks[index - trackContainer.offset];
            return RowContent({ context, index, track });
          }
          return (
            <ScrollSeekPlaceholderNoIndex height={56} />
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
        totalCount={data.pages[0].totalSize}
        onScroll={(e) => {
          if (scrollCount.current < 10) scrollCount.current += 1;
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            'tracks-scroll',
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default Tracks;
