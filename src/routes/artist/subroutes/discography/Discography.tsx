import { Box, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Album, Artist, Track } from 'hex-plex';
import React, {
  useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { FaCaretDown, FaCaretUp } from 'react-icons/all';
import { useLocation, useParams } from 'react-router-dom';
import { GroupedVirtuoso } from 'react-virtuoso';
import TrackMenu from 'components/track-menu/TrackMenu';
import { ButtonSpecs } from 'constants/buttons';
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
import { AlbumWithSection } from 'routes/artist/Artist';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import ListGrouped from 'routes/virtuoso-components/ListGrouped';
import styles from 'styles/ArtistHeader.module.scss';
import { IVirtuosoContext, LocationWithState, RouteParams } from 'types/interfaces';
import GroupRow from './GroupRow';
import GroupRowArtist from './GroupRowArtist';
import Row from './Row';

interface FilterMenuButtonProps extends MenuButtonProps{
  filter: string;
  open: boolean;
}

const FilterMenuButton = React.forwardRef((
  { filter, open, onClick, onKeyDown }: FilterMenuButtonProps,
  ref,
) => (
  <MenuButton
    className={styles['sort-button']}
    ref={ref}
    style={{ zIndex: 200 }}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <Box
      alignItems="center"
      color={open ? 'text.primary' : 'text.secondary'}
      display="flex"
      height={32}
      justifyContent="space-between"
      sx={{
        '&:hover': {
          color: 'text.primary',
        },
      }}
      width={160}
    >
      <Typography>
        {filter}
      </Typography>
      <SvgIcon sx={{ height: 16, width: 16 }}>
        {(open ? <FaCaretUp /> : <FaCaretDown />)}
      </SvgIcon>
    </Box>
  </MenuButton>
));

interface FilterMenuItemProps {
  label: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

const FilterMenuItem = ({ label, setFilter }: FilterMenuItemProps) => (
  <MenuItem
    onClick={() => setFilter(label)}
  >
    <Box alignItems="center" display="flex" justifyContent="space-between" width={1}>
      {label}
    </Box>
  </MenuItem>
);

export interface ArtistDiscographyContext extends IVirtuosoContext {
  artist: ArtistQueryData | undefined;
  filter: string;
  filters: string[];
  groupCounts: number[];
  groups: (AlbumWithSection | Artist)[];
  playAlbum: (album: Album, shuffle?: boolean) => Promise<void>;
  playAlbumAtTrack: (track: Track, shuffle?: boolean) => Promise<void>;
  playArtist: (artist: Artist, shuffle?: boolean) => Promise<void>;
  playArtistRadio: (artist: Artist) => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  topmostGroup: React.MutableRefObject<number>;
}

export interface GroupRowProps {
  album: AlbumWithSection;
  context: ArtistDiscographyContext;
}

export interface GroupRowArtistProps {
  artist: Artist;
  context: ArtistDiscographyContext;
}

export interface RowProps {
  context: ArtistDiscographyContext;
  index: number;
  track: Track;
}

const GroupRowContent = (props: GroupRowProps) => <GroupRow {...props} />;
const GroupRowContentArtist = (props: GroupRowArtistProps) => <GroupRowArtist {...props} />;
const RowContent = (props: RowProps) => <Row {...props} />;

const Discography = () => {
  const config = useConfig();
  const library = useLibrary();
  // data loading
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const artist = useArtist(+id, library);
  const appearances = useArtistAppearances(
    config.data,
    library,
    +id,
    location.state.title,
    location.state.guid,
  );
  const { data: tracks } = useArtistTracks({
    config: config.data,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    removeDupes: false,
    sort: location.state.sort,
  });
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const menuStyle = useMenuStyle();
  const queryClient = useQueryClient();
  const topmostGroup = useRef<number>(0);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('All Releases');
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playSwitch, playAlbum, playAlbumAtTrack, playArtist, playArtistRadio } = usePlayback();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);
  const GROUP_ROW_HEIGHT = 200;

  const [releases, filters]: [releases: AlbumWithSection[], filters: string[] ] = useMemo(() => {
    if (!artist.data || !appearances.data) {
      return [[], []];
    }
    const newFilters: string[] = ['All Releases'];
    const { albums } = artist.data;
    const newAlbums = albums.map((album) => ({ ...album, section: 'Albums' }));
    if (newAlbums.length > 0) newFilters.push('Albums');
    const hubReleases = [] as Album[][];
    artist.data.hubs.forEach((hub) => {
      if (hub.type === 'album' && hub.size > 0) {
        const objs = hub.items.map((album) => ({ ...album, section: hub.title })) as Album[];
        newFilters.push(hub.title);
        hubReleases.push(objs);
      }
    });
    const appearsOn = appearances.data.map((album) => ({ ...album, section: 'Appears On' }));
    if (appearsOn.length > 0) newFilters.push('Appears On');
    const all = [...newAlbums, ...hubReleases.flat(1), ...appearsOn];
    return [all as AlbumWithSection[], newFilters];
  }, [appearances.data, artist.data]);

  const { items, groupCounts, groups } = useMemo(() => {
    if (!tracks || !artist.data) return { items: [], groupCounts: [], groups: [], offsets: [] };
    let newItems = tracks;
    let newGroups: AlbumWithSection[] = [];
    if (filter === 'All Releases') {
      newGroups = releases.filter((release) => release.section !== 'Appears On');
      const newGroupsIds = newGroups.map((album) => album.id);
      newItems = newItems.filter((item) => newGroupsIds.includes(item.parentId));
    }
    if (filter !== 'All Releases') {
      newGroups = releases.filter((release) => release.section === filter);
      const newGroupsIds = newGroups.map((album) => album.id);
      newItems = newItems.filter((item) => newGroupsIds.includes(item.parentId));
    }
    newGroups.sort((a, b) => b.originallyAvailableAt.getTime() - a.originallyAvailableAt.getTime());
    const newGroupCounts = newGroups
      .map((album) => newItems.filter((track) => track.parentId === album.id).length);
    let sum = 200;
    const newOffsets = newGroups
      .map((obj) => [obj, ...newItems.filter((item) => item.parentId === obj.id)])
      .flat()
      .slice(1)
      .map((obj) => (obj.type === 'album' ? GROUP_ROW_HEIGHT : 56))
      // eslint-disable-next-line no-return-assign
      .map((v) => sum += v);
    return {
      items: newItems,
      groupCounts: [0, ...newGroupCounts],
      groups: [artist.data.artist, ...newGroups],
      offsets: [200, ...newOffsets.slice(0, -1)],
    };
  }, [artist, filter, releases, tracks]);

  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: items || [],
  });

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [location, setSelectedRows]);

  useLayoutEffect(() => {
    queryClient.setQueriesData(['disc-header-opacity'], 1);
    queryClient.setQueryData(['discography-header-album'], groups[topmostGroup.current]);
  }, [groups, location, queryClient]);

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
    const target = event.currentTarget.getAttribute('data-item-index');
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

  const artistDiscographyContext = useMemo(() => ({
    artist: artist.data,
    drag,
    filter,
    filters,
    getFormattedTime,
    groupCounts,
    groups,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playAlbum,
    playAlbumAtTrack,
    playArtist,
    playArtistRadio,
    selectedRows,
    setFilter,
    topmostGroup,
  }), [
    artist.data,
    drag,
    filter,
    filters,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleRowClick,
    hoverIndex,
    groupCounts,
    groups,
    isPlaying,
    library,
    nowPlaying,
    playAlbum,
    playAlbumAtTrack,
    playArtist,
    playArtistRadio,
    selectedRows,
    setFilter,
    topmostGroup,
  ]);

  if (!artist.data || !appearances.data || !tracks) {
    return null;
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
        <Box
          position="absolute"
          top={0}
          width={1}
        >
          <Box
            display="flex"
            justifyContent="flex-end"
            margin="auto"
            maxWidth={900}
            width="89%"
          >
            <Menu
              transition
              align="end"
              menuButton={({ open }) => <FilterMenuButton filter={filter} open={open} />}
              menuStyle={menuStyle}
            >
              {filters.map((option) => (
                <FilterMenuItem
                  key={option}
                  label={option}
                  setFilter={setFilter}
                />
              ))}
            </Menu>
          </Box>
        </Box>
        <GroupedVirtuoso
          className="scroll-container"
          components={{
            Footer,
            Item,
            List: ListGrouped,
          }}
          context={artistDiscographyContext}
          groupContent={(index) => {
            if (groups[index].type === 'album') {
              return GroupRowContent(
                { album: groups[index] as AlbumWithSection, context: artistDiscographyContext },
              );
            }
            return GroupRowContentArtist(
              { artist: groups[index] as Artist, context: artistDiscographyContext },
            );
          }}
          groupCounts={groupCounts}
          increaseViewportBy={200}
          isScrolling={handleScrollState}
          itemContent={
            (index, _groupIndex, _data, context) => RowContent(
              { context, index, track: items[index] },
            )
          }
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
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
