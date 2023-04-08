import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { GroupedVirtuoso, GroupedVirtuosoHandle } from 'react-virtuoso';
import { Album, Artist, Library, PlayQueueItem, Track } from 'api/index';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
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
import Group from 'routes/virtuoso-components/Group';
import TopItemList from 'routes/virtuoso-components/TopItemList';
import { LocationWithState, RouteParams } from 'types/interfaces';
import GroupRow from './GroupRow';
import Header from './Header';
import List from './List';
import Row from './Row';

export interface DiscographyContext {
  artist: ArtistQueryData | undefined;
  filter: string;
  filters: string[];
  getFormattedTime: (inMs: number) => string;
  groupCounts: number[];
  groups: AlbumWithSection[];
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  items: Track[];
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  playAlbum: (album: Album, shuffle?: boolean) => Promise<void>;
  playAlbumAtTrack: (track: Track, shuffle?: boolean) => Promise<void>;
  playArtist: (artist: Artist, shuffle?: boolean) => Promise<void>;
  playArtistRadio: (artist: Artist) => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  topmostGroup: React.MutableRefObject<number>;
}

export interface GroupRowProps {
  album: AlbumWithSection;
  context: DiscographyContext;
}

export interface RowProps {
  context: DiscographyContext;
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
  const queryClient = useQueryClient();
  const topmostGroup = useRef<number>(0);
  const virtuoso = useRef<GroupedVirtuosoHandle>(null);
  const [filter, setFilter] = useState('All Releases');
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playAlbum, playAlbumAtTrack, playArtist, playArtistRadio } = usePlayback();
  const GROUP_ROW_HEIGHT = 200;

  useEffect(() => {
    virtuoso.current?.scrollTo({ top: 0 });
  }, [filter]);

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

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [id, queryClient]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const discographyContext: DiscographyContext = useMemo(() => ({
    artist: artist.data,
    filter,
    filters,
    getFormattedTime,
    groupCounts,
    groups,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playAlbum,
    playAlbumAtTrack,
    playArtist,
    playArtistRadio,
    setFilter,
    topmostGroup,
  }), [
    artist.data,
    filter,
    filters,
    getFormattedTime,
    hoverIndex,
    groupCounts,
    groups,
    isPlaying,
    items,
    library,
    nowPlaying,
    playAlbum,
    playAlbumAtTrack,
    playArtist,
    playArtistRadio,
    setFilter,
    topmostGroup,
  ]);

  if (!artist.data || !appearances.data || !tracks) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
    >
      <GroupedVirtuoso
        className="scroll-container grouped"
        components={{
          Footer,
          Group,
          Header,
          List,
          TopItemList,
        }}
        context={discographyContext}
        groupContent={
          (index) => GroupRowContent(
            { album: groups[index], context: discographyContext },
          )
        }
        groupCounts={groupCounts}
        increaseViewportBy={200}
        isScrolling={handleScrollState}
        itemContent={
          (index, _groupIndex, _data, context) => RowContent(
            { context, index, track: items[index] },
          )
        }
        ref={virtuoso}
        style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
      />
    </motion.div>
  );
};

export default Discography;
