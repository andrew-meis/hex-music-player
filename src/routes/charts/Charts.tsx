import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
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
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import Header from './Header';
import Row from './Row';

export interface ChartsContext {
  days: number;
  drag: ConnectDragSource,
  endDate: number;
  startDate: number;
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  selectedRows: number[];
  setEndDate: React.Dispatch<React.SetStateAction<number>>;
  setStartDate: React.Dispatch<React.SetStateAction<number>>;
  setDays: React.Dispatch<React.SetStateAction<number>>;
  topTracks: Track[] | undefined;
}

export interface RowProps {
  context: ChartsContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Charts = () => {
  const [days, setDays] = useState(7);
  const [endDate, setEndDate] = useState(new Date().setHours(23, 59, 59, 0));
  const [startDate, setStartDate] = useState(new Date()
    .setHours(0, 0, 0, 0) - (60000 * 60 * 24 * days));
  // data loading
  const config = useConfig();
  const library = useLibrary();
  const { data: topTracks, isLoading } = useTopTracks({
    config: config.data,
    library,
    limit: 100,
    start: Math.round(startDate / 1000),
    end: Math.round(endDate / 1000),
  });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const location = useLocation();
  const menuStyle = useMenuStyle();
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

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

  useEffect(() => {
    if (days === 0) {
      return;
    }
    setStartDate(new Date().setHours(0, 0, 0, 0) - (1000 * 60 * 60 * 24 * days));
    setEndDate(new Date().setHours(23, 59, 59, 0));
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

  const chartsContext = useMemo(() => ({
    days,
    drag,
    endDate,
    startDate,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    topTracks,
    selectedRows,
    setDays,
    setEndDate,
    setStartDate,
  }), [
    days,
    drag,
    endDate,
    startDate,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    topTracks,
    selectedRows,
    setDays,
    setEndDate,
    setStartDate,
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
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ context, index, track: item })}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 400,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={isLoading || topTracks === undefined ? 0 : topTracks.length}
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
