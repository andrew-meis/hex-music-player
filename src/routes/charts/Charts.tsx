import { Theme, useTheme } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import moment, { Moment } from 'moment';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useNavigationType } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import useFormattedTime from 'hooks/useFormattedTime';
import useMenuStyle from 'hooks/useMenuStyle';
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
import { IConfig } from 'types/interfaces';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import Header from './Header';
import Row from './Row';

export interface ChartsContext {
  config: IConfig;
  days: number;
  drag: ConnectDragSource,
  endDate: moment.Moment;
  startDate: moment.Moment;
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isFetching: boolean;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  selectedRows: number[];
  setEndDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setStartDate: React.Dispatch<React.SetStateAction<moment.Moment>>;
  setDays: React.Dispatch<React.SetStateAction<number>>;
  theme: Theme;
  topTracks: Track[] | undefined;
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
  const menuStyle = useMenuStyle();
  const theme = useTheme();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch } = usePlayback();
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

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-index');
    if (!target) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    if (selectedRows.length === 0) {
      setSelectedRows([targetIndex]);
    }
    if (selectedRows.length === 1 && selectedRows.includes(targetIndex)) {
      // pass
    }
    if (selectedRows.length === 1 && !selectedRows.includes(targetIndex)) {
      setSelectedRows([targetIndex]);
    }
    if (selectedRows.length > 1 && selectedRows.includes(targetIndex)) {
      // pass
    }
    if (selectedRows.length > 1 && !selectedRows.includes(targetIndex)) {
      setSelectedRows([targetIndex]);
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

  const handleMenuSelection = async (button: ButtonSpecs) => {
    if (!topTracks) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => topTracks[n]);
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const tracks = selectedRows.map((n) => topTracks[n]);
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
    }
  };

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
    topTracks,
    selectedRows,
    setDays,
    setEndDate,
    setStartDate,
    theme,
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
    topTracks,
    selectedRows,
    setDays,
    setEndDate,
    setStartDate,
    theme,
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
      <ControlledMenu
        {...menuProps}
        portal
        anchorPoint={anchorPoint}
        menuStyle={menuStyle}
        onClose={() => toggleMenu(false)}
      >
        {selectedRows.length === 1 && trackButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        {selectedRows.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
};

export default Charts;
