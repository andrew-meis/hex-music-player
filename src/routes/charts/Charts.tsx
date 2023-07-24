import { motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEmpty } from 'lodash';
import moment, { Moment } from 'moment';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Track } from 'api/index';
import { TrackTable } from 'components/track-table';
import usePlayback from 'hooks/usePlayback';
import { useTopTracks } from 'queries/track-queries';
import { configAtom, libraryAtom } from 'root/Root';
import { AppTrackViewSettings } from 'types/interfaces';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import Header from './Header';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: true,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const Charts = () => {
  const config = useAtomValue(configAtom);
  const library = useAtomValue(libraryAtom);
  const location = useLocation();
  const setTableKey = useSetAtom(tableKeyAtom);
  const viewSettings = window.electron.readConfig('charts-view-settings') as AppTrackViewSettings;
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playTracks, playUri } = usePlayback();

  useEffect(() => {
    setTableKey('charts');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  const { data: tracks, isFetching, isLoading } = useTopTracks({
    config,
    library,
    limit: 100,
    start: startDate.unix(),
    end: endDate.unix(),
  });

  useEffect(() => () => sessionStorage.setItem(
    'charts-state',
    JSON.stringify({ days, endDate, startDate }),
  ), [days, endDate, startDate]);

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
      librarySectionID: config.sectionId,
      'viewedAt>': startDate.unix(),
      'viewedAt<': endDate.unix(),
      limit: 101,
      accountID: 1,
    };
    return `/library/all/top?${new URLSearchParams(uriParams as any).toString()}`;
  }, [config, endDate, startDate]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => {
    if (sortedItems && !isEmpty(sortedItems)) {
      playTracks(sortedItems, shuffle, key);
      return;
    }
    playUri(uri, shuffle, key);
  }, [playTracks, playUri, uri]);

  if (isLoading) return null;

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
          'charts-scroll',
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        days={days}
        endDate={endDate}
        handlePlayNow={handlePlayNow}
        isFetching={isFetching}
        setDays={setDays}
        setEndDate={setEndDate}
        setStartDate={setStartDate}
        startDate={startDate}
      />
      <TrackTable
        columnOptions={
          typeof viewSettings !== 'undefined'
            ? viewSettings.columns
            : defaultViewSettings.columns
        }
        isViewCompact={
          typeof viewSettings !== 'undefined'
            ? viewSettings.compact
            : defaultViewSettings.compact
        }
        library={library}
        multiLineRating={
          typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineRating
            : defaultViewSettings.multiLineRating
        }
        playbackFn={handlePlayNow}
        rows={tracks || []}
        scrollRef={scrollRef}
        subtextOptions={{
          albumTitle: true,
          artistTitle: true,
          showSubtext: typeof viewSettings !== 'undefined'
            ? viewSettings.multiLineTitle
            : defaultViewSettings.multiLineTitle,
        }}
        tableKey="charts"
      />
    </motion.div>
  );
};

export default Charts;
