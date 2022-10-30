import { Box, Typography } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ConnectDragSource, useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import { useIsPlaying, useLibrary, useNowPlaying, useTopTracks } from '../../hooks/queryHooks';
import useFormattedTime from '../../hooks/useFormattedTime';
import useMenuStyle from '../../hooks/useMenuStyle';
import usePlayback from '../../hooks/usePlayback';
import useRowSelect from '../../hooks/useRowSelect';
import { DragActions } from '../../types/enums';
import Footer from '../virtuoso-components/Footer';
import Item from '../virtuoso-components/Item';
import List from '../virtuoso-components/List';
import Row from './Row';
import ScrollSeekPlaceholder from '../virtuoso-components/ScrollSeekPlaceholder';

const Header = () => (
  <Box
    alignItems="center"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    maxWidth="900px"
    mx="auto"
    width="89%"
  >
    <Typography sx={{ fontWeight: 600 }} variant="h4">Charts</Typography>
  </Box>
);

const previewOptions = {
  offsetX: -8,
};

export interface ChartsContext {
  drag: ConnectDragSource,
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  selectedRows: number[];
  topTracks: Track[] | undefined;
}

export interface RowProps {
  index: number;
  item: Track;
  context: ChartsContext;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Charts = () => {
  // data loading
  const { data: topTracks, isLoading } = useTopTracks({ seconds: 60 * 60 * 24 * 14, limit: 300 });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const location = useLocation();
  const menuStyle = useMenuStyle();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

  const [, drag, dragPreview] = useDrag(() => ({
    previewOptions,
    type: selectedRows.length > 1 ? DragActions.COPY_TRACKS : DragActions.COPY_TRACK,
    item: () => {
      if (!topTracks) {
        return [];
      }
      if (selectedRows.length === 1) {
        return topTracks[selectedRows[0]];
      }
      return selectedRows.map((n) => topTracks![n]);
    },
  }), [topTracks, selectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const handleDragStart = useCallback(() => {
    if (selectedRows.includes(hoverIndex.current!)) {
      return;
    }
    setSelectedRows([hoverIndex.current!]);
  }, [selectedRows, setSelectedRows]);

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
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDragStart,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    topTracks,
    selectedRows,
  }), [
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDragStart,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    topTracks,
    selectedRows,
  ]);

  if (isLoading) {
    return null;
  }

  if (!topTracks || topTracks.length === 0) {
    return (
      <Typography color="text.primary" variant="h5">
        No top tracks :/
      </Typography>
    );
  }

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
          data={topTracks}
          fixedItemHeight={56}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ index, item, context })}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 400,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={topTracks.length}
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
