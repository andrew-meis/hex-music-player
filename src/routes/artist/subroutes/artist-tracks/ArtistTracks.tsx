import { Theme, useTheme } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ConnectDragSource } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import useFormattedTime from 'hooks/useFormattedTime';
import useMenuStyle from 'hooks/useMenuStyle';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useConfig, useLibrary } from 'queries/app-queries';
import { ArtistQueryData, useArtist, useArtistTracks } from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IConfig, LocationWithState, RouteParams } from 'types/interfaces';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../../../constants/buttons';
import Header from './Header';
import Row from './Row';

export interface ArtistTracksContext {
  artist: ArtistQueryData | undefined;
  config: IConfig;
  drag: ConnectDragSource,
  filter: string;
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  selectedRows: number[];
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSort: React.Dispatch<React.SetStateAction<string>>;
  sort: string;
  theme: Theme;
}

export interface RowProps {
  context: ArtistTracksContext;
  index: number;
  track: Track;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const ArtistTracks = () => {
  const config = useConfig();
  const library = useLibrary();
  const navigationType = useNavigationType();
  // data loading
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const [sort, setSort] = useState(() => {
    if (navigationType === 'POP') {
      return (sessionStorage.getItem(`artist-tracks ${id}`)
        ? sessionStorage.getItem(`artist-tracks ${id}`)!
        : location.state.sort);
    }
    return location.state.sort;
  });
  const artist = useArtist(+id, library);
  const { data: tracks, isLoading } = useArtistTracks({
    config: config.data,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    sort,
  });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const menuStyle = useMenuStyle();
  const theme = useTheme();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('');
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  useEffect(() => () => sessionStorage.setItem(`artist-tracks ${id}`, sort), [id, sort]);

  let items: Track[] = [];
  if (tracks) {
    items = tracks.filter(
      (track) => track.title?.toLowerCase().includes(filter.toLowerCase())
      || track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
      || track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
    );
  }

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: items || [],
  });

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

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
    if (!items) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => items[n]);
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const selectedTracks = selectedRows.map((n) => items[n]);
      await playSwitch(button.action, { tracks: selectedTracks, shuffle: button.shuffle });
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
    top = sessionStorage.getItem(`artist-tracks ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

  const artistTracksContext = useMemo(() => ({
    artist: artist.data,
    config: config.data,
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    selectedRows,
    setFilter,
    setSort,
    sort,
    theme,
  }), [
    artist.data,
    config,
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    selectedRows,
    setFilter,
    setSort,
    sort,
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
          context={artistTracksContext}
          data={artist.isLoading || isLoading ? [] : items}
          fixedItemHeight={56}
          initialScrollTop={initialScrollTop()}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => RowContent({ context, index, track: item })}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={isLoading || tracks === undefined ? 0 : items.length}
          onScroll={(e) => {
            const target = e.currentTarget as unknown as HTMLDivElement;
            sessionStorage.setItem(
              `artist-tracks ${id}`,
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

export default ArtistTracks;
