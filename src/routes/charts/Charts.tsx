import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Track } from 'hex-plex';
import moment, { Moment } from 'moment';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useTopTracks } from 'queries/track-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IConfig, IVirtuosoContext } from 'types/interfaces';
import Header from './Header';
import Row from './Row';

export interface ChartsContext extends IVirtuosoContext {
  config: IConfig;
  days: number;
  endDate: moment.Moment;
  startDate: moment.Moment;
  isFetching: boolean;
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
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch, playUri } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);
  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: topTracks || [],
  });

  useEffect(
    () => () => sessionStorage.setItem(
      'charts-state',
      JSON.stringify({ days, endDate, startDate }),
    ),
    [days, endDate, startDate],
  );

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

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

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const selectedTracks = useMemo(() => {
    if (!topTracks) {
      return undefined;
    }
    if (selectedRows.length > 0) {
      return selectedRows.map((n) => topTracks[n]);
    }
    return undefined;
  }, [selectedRows, topTracks]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-index');
    if (!target) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    switch (true) {
      case selectedRows.length === 0:
        setSelectedRows([targetIndex]);
        break;
      case selectedRows.length === 1 && !selectedRows.includes(targetIndex):
        setSelectedRows([targetIndex]);
        break;
      case selectedRows.length > 1 && !selectedRows.includes(targetIndex):
        setSelectedRows([targetIndex]);
        break;
      default:
        break;
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = () => {
    let top;
    top = sessionStorage.getItem('charts');
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

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

  const chartsContext = useMemo(() => ({
    config: config.data,
    days,
    drag,
    endDate,
    startDate,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isFetching,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    selectedRows,
    setDays,
    setEndDate,
    setStartDate,
    topTracks,
    uri,
  }), [
    config,
    days,
    drag,
    endDate,
    startDate,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isFetching,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    selectedRows,
    setDays,
    setEndDate,
    setStartDate,
    topTracks,
    uri,
  ]);

  return (
    <>
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
            Item,
            List,
            ScrollSeekPlaceholder,
          }}
          context={chartsContext}
          data={isLoading ? [] : topTracks}
          fixedItemHeight={56}
          initialScrollTop={initialScrollTop()}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ context, index, track: item })}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={isLoading || topTracks === undefined ? 0 : topTracks.length}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              'charts',
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedTracks}
        {...menuProps}
      />
    </>
  );
};

export default Charts;
