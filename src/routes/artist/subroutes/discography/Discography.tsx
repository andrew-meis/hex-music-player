import { Theme, useTheme } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Album, Track } from 'hex-plex';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import useFormattedTime from 'hooks/useFormattedTime';
import useMenuStyle from 'hooks/useMenuStyle';
import usePlayback from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { useConfig, useLibrary } from 'queries/app-queries';
import {
  ArtistQueryData,
  useArtist,
  useArtistAppearances,
  useArtistTracks,
} from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import List from 'routes/virtuoso-components/List';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IConfig, IVirtuosoContext, LocationWithState, RouteParams } from 'types/interfaces';
import { ButtonSpecs } from '../../../../constants/buttons';
import Header from './Header';
import Row from './Row';

export interface ArtistTracksContext extends IVirtuosoContext {
  albums: Album[];
  artist: ArtistQueryData | undefined;
  config: IConfig;
  filter: string;
  items: Track[];
  playTracks: (tracks: Track[], shuffle?: boolean, key?: string) => Promise<void>;
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

const Discography = () => {
  const config = useConfig();
  const library = useLibrary();
  const navigationType = useNavigationType();
  // data loading
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const [sort, setSort] = useState(() => {
    if (navigationType === 'POP') {
      return (sessionStorage.getItem(`artist-discography ${id}`)
        ? sessionStorage.getItem(`artist-discography ${id}`)!
        : location.state.sort);
    }
    return location.state.sort;
  });
  const artist = useArtist(+id, library);
  const appearances = useArtistAppearances(
    config.data,
    library,
    +id,
    location.state.title,
    location.state.guid,
  );
  const { data: tracks, isLoading } = useArtistTracks({
    config: config.data,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    removeDupes: false,
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
  const { playSwitch, playTracks } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  useEffect(() => () => sessionStorage.setItem(`artist-discography ${id}`, sort), [id, sort]);

  const albums: Album[] = useMemo(() => {
    const newAlbums = [];
    if (artist.data && appearances.data) {
      newAlbums.push(...artist.data.albums);
      artist.data.hubs.forEach((hub) => {
        if (hub.type === 'album') newAlbums.push(...hub.items as Album[]);
      });
      newAlbums.push(...appearances.data);
    }
    return newAlbums;
  }, [appearances.data, artist.data]);

  let items: Track[] = useMemo(() => [], []);
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

  const getTrackId = useCallback(() => {
    if (selectedRows.length === 1) {
      return items[selectedRows[0]].id;
    }
    return 0;
  }, [items, selectedRows]);

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
    top = sessionStorage.getItem(`artist-discography-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

  const artistTracksContext = useMemo(() => ({
    albums,
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
    items,
    library,
    nowPlaying,
    playTracks,
    selectedRows,
    setFilter,
    setSort,
    sort,
    theme,
  }), [
    albums,
    artist.data,
    config,
    drag,
    filter,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    items,
    isPlaying,
    library,
    nowPlaying,
    playTracks,
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
          data={artist.isLoading || appearances.isLoading || isLoading ? [] : items}
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
              `artist-discography-scroll ${id}`,
              target.scrollTop as unknown as string,
            );
          }}
        />
      </motion.div>
      <TrackMenu
        anchorPoint={anchorPoint}
        handleMenuSelection={handleMenuSelection}
        id={getTrackId()}
        menuProps={menuProps}
        menuStyle={menuStyle}
        selectedRows={selectedRows}
        toggleMenu={toggleMenu}
      />
    </>
  );
};

export default Discography;
