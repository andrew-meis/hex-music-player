import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import moment, { Moment } from 'moment';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Library, PlayQueueItem, Track } from 'api/index';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useTopTracks } from 'queries/track-queries';
import Footer from 'routes/virtuoso-components/Footer';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { AppConfig } from 'types/interfaces';
import Header from './Header';
import List from './List';
import Row from './Row';

export interface ChartsContext {
  config: AppConfig;
  days: number;
  endDate: moment.Moment;
  startDate: moment.Moment;
  getFormattedTime: (inMs: number) => string;
  hoverIndex: React.MutableRefObject<number | null>;
  isFetching: boolean;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  playUri: (uri: string, shuffle?: boolean, key?: string) => Promise<void>;
  setEndDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setStartDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setDays: React.Dispatch<React.SetStateAction<number>>;
  topTracks: Track[] | undefined;
  uri: string;
}

export interface RowProps {
  context: ChartsContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Charts = () => {
  const navigationType = useNavigationType();
  const savedState = JSON.parse(sessionStorage.getItem('charts-state') || '{}');
  const [days, setDays] = useState(() => {
    if (navigationType === 'POP' && Object.keys(savedState).length > 0) {
      return savedState.days as number;
    }
    return 7;
  });
  const [endDate, setEndDate] = useState(() => {
    if (navigationType === 'POP' && Object.keys(savedState).length > 0) {
      return moment(savedState.endDate) as Moment;
    }
    return moment().hours(23).minutes(59).seconds(59);
  });
  const [startDate, setStartDate] = useState(() => {
    if (navigationType === 'POP' && Object.keys(savedState).length > 0) {
      return moment(savedState.startDate) as Moment;
    }
    return moment().hours(0).minutes(0).seconds(0);
  });
  // data loading
  const config = useConfig();
  const library = useLibrary();
  const { data: topTracks, isFetching, isLoading } = useTopTracks({
    config: config.data,
    library,
    limit: 100,
    start: startDate.unix(),
    end: endDate.unix(),
  });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const location = useLocation();
  const scrollCount = useRef(0);
  const queryClient = useQueryClient();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playUri } = usePlayback();

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [queryClient]);

  useEffect(
    () => () => sessionStorage.setItem(
      'charts-state',
      JSON.stringify({ days, endDate, startDate }),
    ),
    [days, endDate, startDate],
  );

  useEffect(() => {
    if (days === 0) {
      return;
    }
    setStartDate(moment()
      .subtract(days, 'days')
      .hours(0)
      .minutes(0)
      .seconds(0));
    setEndDate(moment().hours(23).minutes(59).seconds(59));
  }, [days]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem('charts-scroll');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      'charts-scroll',
      0 as unknown as string,
    );
    return 0;
  }, [navigationType]);

  const uri = useMemo(() => {
    const uriParams = {
      type: 10,
      librarySectionID: config.data.sectionId,
      'viewedAt>': startDate.unix(),
      'viewedAt<': endDate.unix(),
      limit: 101,
      accountID: 1,
    };
    return `/library/all/top?${new URLSearchParams(uriParams as any).toString()}`;
  }, [config.data, endDate, startDate]);

  const chartsContext: ChartsContext = useMemo(() => ({
    config: config.data,
    days,
    endDate,
    startDate,
    getFormattedTime,
    hoverIndex,
    isFetching,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    setDays,
    setEndDate,
    setStartDate,
    topTracks,
    uri,
  }), [
    config,
    days,
    endDate,
    startDate,
    getFormattedTime,
    hoverIndex,
    isFetching,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    setDays,
    setEndDate,
    setStartDate,
    topTracks,
    uri,
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
          Footer,
          Header,
          List,
          ScrollSeekPlaceholder,
        }}
        context={chartsContext}
        data={isLoading ? [] : topTracks}
        fixedItemHeight={56}
        isScrolling={handleScrollState}
        itemContent={(index, item, context) => RowContent({ context, index, track: item })}
        ref={virtuoso}
        scrollSeekConfiguration={{
          enter: (velocity) => {
            if (scrollCount.current < 10) return false;
            return Math.abs(velocity) > 500;
          },
          exit: (velocity) => Math.abs(velocity) < 100,
        }}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
        totalCount={isLoading || topTracks === undefined ? 0 : topTracks.length}
        onScroll={(e) => {
          if (scrollCount.current < 10) scrollCount.current += 1;
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            'charts-scroll',
            target.scrollTop as unknown as string,
          );
        }}
      />
    </motion.div>
  );
};

export default Charts;
