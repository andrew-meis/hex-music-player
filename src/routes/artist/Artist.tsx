import { Box, SvgIcon } from '@mui/material';
import { MenuDivider, MenuItem, useMenuState } from '@szhsin/react-menu';
import { inPlaceSort } from 'fast-sort';
import { motion } from 'framer-motion';
import { isEmpty, throttle } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MdMusicOff } from 'react-icons/all';
import {
  NavigateFunction,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { ListProps, Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { Album, Artist as TypeArtist, Library, PlayQueueItem, Track } from 'api/index';
import { HexSort, plexSort } from 'classes';
import AlbumMenu from 'components/menus/AlbumMenu';
import Palette from 'components/palette/Palette';
import { VIEW_PADDING } from 'constants/measures';
import { useLibraryMaintenance } from 'hooks/plexHooks';
import useFormattedTime from 'hooks/useFormattedTime';
import useHideAlbum from 'hooks/useHideAlbum';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useConfig, useLibrary, useSettings } from 'queries/app-queries';
import {
  ArtistQueryData,
  useArtist,
  useArtistAppearances,
  useArtistTracks,
} from 'queries/artist-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useRecentTracks } from 'queries/track-queries';
import FooterWide from 'routes/virtuoso-components/FooterWide';
import { getColumns } from 'scripts/get-columns';
import { PlayActions, SortOrders, TrackSortKeys } from 'types/enums';
import {
  AlbumWithSection,
  AppSettings,
  CardMeasurements,
  // HexSort,
  LocationWithState,
  RouteParams,
} from 'types/interfaces';
import Header from './Header';
import Row from './Row';

const List = React
  .forwardRef((
    // @ts-ignore
    { style, children }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <Box
      className="album-row-box"
      ref={listRef}
      style={{
        ...style,
        minHeight: 'calc(100% - 114px)',
      }}
    >
      {children}
    </Box>
  ));

export interface ArtistContext {
  artist: ArtistQueryData | undefined;
  colors: string[] | undefined;
  cols: number;
  filter: string;
  filters: string[];
  getFormattedTime: (inMs: number) => string;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  isPlaying: boolean;
  library: Library;
  measurements: CardMeasurements;
  menuTarget: Album[];
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  playArtist: (artist: TypeArtist, shuffle?: boolean) => Promise<void>;
  playArtistRadio: (artist: TypeArtist) => Promise<void>;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  recentFavorites: Track[] | undefined;
  refreshMetadata: (id: number) => Promise<void>;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSort: React.Dispatch<React.SetStateAction<HexSort>>;
  settings: AppSettings;
  sort: HexSort;
  topTracks: Track[] | undefined;
  width: number;
}

export interface RowProps {
  albums: AlbumWithSection[];
  index: number;
  context: ArtistContext;
}

const RowContent = (props: RowProps) => <Row {...props} />;

const Artist = () => {
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
  const topTracks = useArtistTracks({
    config: config.data,
    library,
    id: +id,
    title: location.state.title,
    guid: location.state.guid,
    sort: plexSort(TrackSortKeys.PLAYCOUNT, SortOrders.DESC),
    slice: 5,
  });
  const recentTracks = useRecentTracks({
    config: config.data,
    library,
    id: +id,
    days: 90,
  });
  // other hooks
  const hideAlbum = useHideAlbum();
  const menuSection = useRef<string | null>();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const virtuoso = useRef<VirtuosoHandle>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('All Releases');
  const [menuTarget, setMenuTarget] = useState<Album[]>([]);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: settings } = useSettings();
  const { getFormattedTime } = useFormattedTime();
  const { playArtist, playArtistRadio, playSwitch } = usePlayback();
  const { refreshMetadata } = useLibraryMaintenance();
  const { width } = useOutletContext() as { width: number };
  // create array for virtualization
  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const [sort, setSort] = useState(HexSort.parse(settings.albumSort!));
  const data = useMemo(() => {
    if (!artist.data || !appearances.data) {
      return { filters: [], releases: [] };
    }
    const filters: string[] = ['All Releases'];
    const { albums } = artist.data;
    const newAlbums = albums.map((album) => ({ ...album, section: 'Albums' }));
    if (newAlbums.length > 0) filters.push('Albums');
    const hubReleases = [] as Album[][];
    artist.data.hubs.forEach((hub) => {
      if (hub.type === 'album' && hub.size > 0) {
        const objs = hub.items.map((album) => ({ ...album, section: hub.title })) as Album[];
        filters.push(hub.title);
        hubReleases.push(objs);
      }
    });
    const appearsOn = appearances.data.map((album) => ({ ...album, section: 'Appears On' }));
    if (appearsOn.length > 0) filters.push('Appears On');
    const releases = [...newAlbums, ...hubReleases.flat(1), ...appearsOn] as AlbumWithSection[];
    if (sort.order === 'asc') {
      inPlaceSort(releases).asc((release) => release[sort.by]);
    }
    if (sort.order === 'desc') {
      inPlaceSort(releases).desc((release) => release[sort.by]);
    }
    return {
      filters,
      releases,
    };
  }, [appearances.data, artist.data, sort]);

  const items = useMemo(() => {
    if (!data.releases || !artist.data) {
      return [];
    }
    let filtered = [] as AlbumWithSection[];
    if (filter === 'All Releases') {
      filtered = data.releases.filter((release) => release.section !== 'Appears On');
    }
    if (filter !== 'All Releases') {
      filtered = data.releases.filter((release) => release.section === filter);
    }
    const rows = [];
    for (let i = 0; i < filtered.length; i += grid.cols) {
      const row = filtered.slice(i, i + grid.cols);
      rows.push(row);
    }
    return rows;
  }, [data, artist, filter, grid]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    const section = event.currentTarget.getAttribute('data-section');
    if (!target || !section) {
      return;
    }
    menuSection.current = section;
    const targetId = parseInt(target, 10);
    setMenuTarget(data.releases.filter((album) => album.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [data.releases, toggleMenu]);

  const handleHideAlbum = useCallback(async () => {
    if (!artist.data || menuTarget.length === 0) {
      return;
    }
    const [album] = menuTarget;
    const appearanceCount = data.releases.filter((x) => x.section === 'Appears On').length;
    if (appearanceCount === 1) setFilter('All Releases');
    await hideAlbum(artist.data.artist, album);
  }, [artist.data, data, hideAlbum, menuTarget]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`artist-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `artist-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  const measurements = useMemo(() => {
    const { cols } = grid;
    return {
      IMAGE_SIZE:
        Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
      ROW_HEIGHT: Math.floor((width - VIEW_PADDING) / cols) + (settings.albumText ? 54 : 0),
      ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
    };
  }, [grid, settings, width]);

  const artistContext = useMemo(() => ({
    artist: artist.data,
    cols: grid.cols,
    filter,
    filters: data.filters,
    getFormattedTime,
    handleContextMenu,
    isPlaying,
    library,
    measurements,
    menuTarget,
    navigate,
    nowPlaying,
    playArtist,
    playArtistRadio,
    playSwitch,
    recentFavorites: recentTracks.data.slice(0, 12),
    refreshMetadata,
    setFilter,
    setSort,
    settings,
    sort,
    topTracks: topTracks.data,
    width,
  }), [
    artist.data,
    data,
    filter,
    getFormattedTime,
    grid.cols,
    handleContextMenu,
    isPlaying,
    library,
    measurements,
    menuTarget,
    navigate,
    nowPlaying,
    playArtist,
    playArtistRadio,
    playSwitch,
    recentTracks.data,
    refreshMetadata,
    setFilter,
    setSort,
    settings,
    sort,
    topTracks.data,
    width,
  ]);

  if (isEmpty(items) || !artist.data || !topTracks.data || !recentTracks.data) {
    return null;
  }

  return (
    <Palette
      id={artist.data.artist.art || artist.data.artist.thumb}
      url={library.api.getAuthenticatedUrl(artist.data.artist.art || artist.data.artist.thumb)}
    >
      {({ data: colors, isLoading, isError }) => {
        if (isLoading || isError) {
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
              onAnimationComplete={() => virtuoso.current
                ?.scrollTo({ top: initialScrollTop })}
            >
              <Virtuoso
                className="scroll-container"
                components={{
                  Footer: FooterWide,
                  Header,
                  List,
                }}
                context={{ ...artistContext, colors: Object.values(colors) as string[] }}
                data={items}
                fixedItemHeight={measurements.ROW_HEIGHT}
                increaseViewportBy={{ top: 0, bottom: 700 }}
                isScrolling={handleScrollState}
                itemContent={(index, item, context) => RowContent({ albums: item, index, context })}
                ref={virtuoso}
                style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
                onScroll={(e) => {
                  const target = e.currentTarget as unknown as HTMLDivElement;
                  sessionStorage.setItem(
                    `artist-scroll ${id}`,
                    target.scrollTop as unknown as string,
                  );
                }}
              />
            </motion.div>
            <AlbumMenu
              albums={menuTarget}
              anchorPoint={anchorPoint}
              artistLink={menuSection.current === 'Appears On'}
              playSwitch={playSwitch}
              toggleMenu={toggleMenu}
              onClose={() => {
                menuSection.current = null;
                toggleMenu(false);
                setMenuTarget([]);
              }}
              {...menuProps}
            >
              {menuSection.current === 'Appears On' && (
              <>
                <MenuDivider />
                <MenuItem
                  className="error"
                  onClick={handleHideAlbum}
                >
                  <SvgIcon sx={{ mr: '8px' }}><MdMusicOff /></SvgIcon>
                  Hide album
                </MenuItem>
              </>
              )}
            </AlbumMenu>
          </>
        );
      }}
    </Palette>
  );
};

export default Artist;
