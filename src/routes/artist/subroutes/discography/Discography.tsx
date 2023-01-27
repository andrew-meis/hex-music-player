import { useMenuState } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Album, Artist, Track } from 'hex-plex';
import React, {
  ComponentType, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState,
} from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { useLocation, useParams } from 'react-router-dom';
import { GroupedVirtuoso, TopItemListProps } from 'react-virtuoso';
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
import { AlbumWithSection } from 'routes/artist/Artist';
import Footer from 'routes/virtuoso-components/Footer';
import Item from 'routes/virtuoso-components/Item';
import ListGrouped from 'routes/virtuoso-components/ListGrouped';
import ScrollSeekPlaceholder from 'routes/virtuoso-components/ScrollSeekPlaceholder';
import { IVirtuosoContext, LocationWithState, RouteParams } from 'types/interfaces';
import { ButtonSpecs } from '../../../../constants/buttons';
import GroupRow from './GroupRow';
import Header from './Header';
import Row from './Row';

const GroupHeaderContainer: ComponentType<TopItemListProps> = ({
  children,
  ...rest
}: TopItemListProps) => (
  <div {...rest} style={{ position: 'static' }}>
    {children}
  </div>
);

export interface ArtistDiscographyContext extends IVirtuosoContext {
  artist: ArtistQueryData | undefined;
  filter: string;
  filters: string[];
  groupCounts: number[];
  groups: AlbumWithSection[];
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

export interface RowProps {
  context: ArtistDiscographyContext;
  index: number;
  track: Track;
}

const GroupRowContent = (props: GroupRowProps) => <GroupRow {...props} />;
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
  const [scrollRef, setScrollRef] = useState<HTMLDivElement>();
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

  const { items, groupCounts, groups, offsets } = useMemo(() => {
    if (!tracks) return { items: [], groupCounts: [], groups: [], offsets: [] };
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
      groupCounts: newGroupCounts,
      groups: newGroups,
      offsets: [200, ...newOffsets.slice(0, -1)],
    };
  }, [filter, releases, tracks]);

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
        className="scroll-container"
        exit={{ opacity: 0 }}
        id="discography-scroll-container"
        initial={{ opacity: 0 }}
        key={location.pathname}
        ref={setScrollRef as React.Ref<HTMLDivElement> | undefined}
        style={{ height: '100%', overflow: 'overlay' }}
        onScroll={() => {
          const container = document.querySelector('#discography-scroll-container');
          if (!container) return;
          const targetOffset = offsets.slice().reverse().find((v) => v <= container.scrollTop);
          const targetIndex = offsets.findIndex((v) => v === targetOffset);
          let targetElement;
          targetElement = document.querySelector(
            `div.virtuoso-item[data-index="${targetIndex + 1}"][data-known-size="56"]`,
          ) as HTMLElement;
          if (!targetElement) {
            targetElement = document.querySelector(
              `div[data-index="${targetIndex + 1}"][data-known-size="${GROUP_ROW_HEIGHT}"]`,
            ) as HTMLElement;
          }
          if (!targetElement) return;
          let intersectingGroupIndex;
          intersectingGroupIndex = targetElement.getAttribute('data-item-group-index');
          if (!intersectingGroupIndex) {
            intersectingGroupIndex = targetElement.getAttribute('data-item-index');
          }
          if (!intersectingGroupIndex) return;
          const asNumber = parseInt(intersectingGroupIndex, 10);
          if (topmostGroup.current !== asNumber) {
            queryClient.setQueryData(['discography-header-album'], groups[asNumber]);
            topmostGroup.current = asNumber;
          }
          if (container.scrollTop === 0) {
            queryClient.setQueriesData(['disc-header-opacity'], 1);
            return;
          }
          queryClient.setQueriesData(['disc-header-opacity'], 1);
          queryClient.setQueryData(['disc-header-opacity', groups[asNumber].id], 0);
        }}
      >
        <Header context={artistDiscographyContext} />
        <GroupedVirtuoso
          atTopStateChange={(atTop) => {
            if (atTop) {
              topmostGroup.current = 0;
            }
            queryClient.setQueryData(['at-top'], atTop);
          }}
          components={{
            Footer,
            Item,
            List: ListGrouped,
            ScrollSeekPlaceholder,
            TopItemList: GroupHeaderContainer,
          }}
          context={artistDiscographyContext}
          customScrollParent={scrollRef as unknown as HTMLElement}
          groupContent={(index) => GroupRowContent(
            { album: groups[index], context: artistDiscographyContext },
          )}
          groupCounts={groupCounts}
          increaseViewportBy={200}
          isScrolling={handleScrollState}
          itemContent={
            (index, _groupIndex, _data, context) => RowContent(
              { context, index, track: items[index] },
            )
          }
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 500,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflow: 'hidden' }}
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
