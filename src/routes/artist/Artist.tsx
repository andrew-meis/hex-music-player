import { Box, SvgIcon, useTheme } from '@mui/material';
import { ControlledMenu, MenuDivider, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
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
import { Virtuoso } from 'react-virtuoso';
import Palette from 'components/palette/Palette';
import { useLibraryMaintenance } from 'hooks/plexHooks';
import useFormattedTime from 'hooks/useFormattedTime';
import useHideAlbum from 'hooks/useHideAlbum';
import useMenuStyle from 'hooks/useMenuStyle';
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
import { useTrackHistory } from 'queries/track-queries';
import { PlayActions, PlexSortKeys, QueryKeys, SortOrders } from 'types/enums';
import { albumButtons, ButtonSpecs } from '../../constants/buttons';
import AlbumsRow from './AlbumsRow';
import Header from './Header';
import type { Album, Artist as TArtist, Library, PlayQueueItem, Track } from 'hex-plex';
import type { IAppSettings, LocationWithState, RouteParams } from 'types/interfaces';

const Footer = () => (
  <Box
    height="20px"
    maxWidth={900}
    mx="auto"
    width="89%"
  />
);

const getCols = (width: number) => {
  if (width >= 1350) {
    return 6;
  }
  if (width < 1350 && width >= 1100) {
    return 5;
  }
  if (width < 1100 && width >= 850) {
    return 4;
  }
  if (width < 850 && width >= 650) {
    return 3;
  }
  if (width < 650) {
    return 2;
  }
  return 4;
};

export interface ArtistGroup {
  _type: string;
  identifier: string;
  text: string;
}

export interface AlbumWithSection extends Album {
  section: string;
}

export interface AlbumRow {
  _type: string;
  albums: AlbumWithSection[];
  grid: { cols: number };
  artist: TArtist;
}

export interface ArtistContext {
  artist: ArtistQueryData | undefined;
  colors: string[] | undefined;
  filter: string;
  filters: string[];
  getFormattedTime: (inMs: number) => string;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  isPlaying: boolean;
  library: Library;
  menuTarget: number | undefined;
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  playArtist: (artist: TArtist, shuffle?: boolean) => Promise<void>;
  playArtistRadio: (artist: TArtist) => Promise<void>;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  recentFavorites: Track[] | undefined;
  refreshMetadata: (id: number) => Promise<void>;
  refreshPage: () => void;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
  setSort: React
    .Dispatch<React.SetStateAction<{ by: string, order: string }>>;
  settings: IAppSettings;
  sort: { by: string, order: string }
  topTracks: Track[] | undefined;
  width: number;
}

export interface RowProps {
  index: number;
  item: AlbumRow;
  context: ArtistContext;
}

const RowContent = (props: RowProps) => <AlbumsRow {...props} />;

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
    sort: [
      PlexSortKeys.PLAYCOUNT,
      SortOrders.DESC,
    ].join(''),
    slice: 5,
  });
  const recentFavorites = useTrackHistory({
    config: config.data,
    library,
    id: +id,
    days: 90,
  });
  // other hooks
  const hideAlbum = useHideAlbum();
  const menuSection = useRef<string | null>();
  const menuStyle = useMenuStyle();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [filter, setFilter] = useState('All Releases');
  const [menuTarget, setMenuTarget] = useState<number | undefined>();
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: settings } = useSettings();
  const { getFormattedTime } = useFormattedTime();
  const { playArtist, playArtistRadio, playSwitch } = usePlayback();
  const { refreshMetadata } = useLibraryMaintenance();
  const { width } = useOutletContext() as { width: number };
  // create array for virtualization
  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);
  const [sort, setSort] = useState(settings.albumSort!);
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
    const releases = [...newAlbums, ...hubReleases.flat(1), ...appearsOn];
    if (sort.by === 'added') {
      releases
        .sort((a, b) => b.addedAt.getTime() - a.addedAt.getTime());
      if (sort.order === 'asc') {
        releases.reverse();
      }
    }
    if (sort.by === 'date') {
      releases
        .sort((a, b) => b.originallyAvailableAt.getTime() - a.originallyAvailableAt.getTime());
      if (sort.order === 'asc') {
        releases.reverse();
      }
    }
    if (sort.by === 'played') {
      releases
        .sort((a, b) => b.lastViewedAt.getTime() - a.lastViewedAt.getTime());
      if (sort.order === 'asc') {
        releases.reverse();
      }
    }
    if (sort.by === 'plays') {
      releases.sort((a, b) => b.viewCount - a.viewCount);
      if (sort.order === 'asc') {
        releases.reverse();
      }
    }
    if (sort.by === 'title') {
      releases.sort((a, b) => a.title.localeCompare(b.title, 'en', { sensitivity: 'base' }));
      if (sort.order === 'desc') {
        releases.reverse();
      }
    }
    if (sort.by === 'type') {
      if (sort.order === 'desc') {
        releases.reverse();
      }
    }
    return {
      filters,
      releases: releases as AlbumWithSection[],
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
      rows.push({
        _type: 'albums', albums: row, grid, artist: artist.data.artist,
      });
    }
    return rows;
  }, [data.releases, artist.data, filter, grid]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    const section = event.currentTarget.getAttribute('data-section');
    if (!target || !section) {
      return;
    }
    menuSection.current = section;
    setMenuTarget(parseInt(target, 10));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [toggleMenu]);

  const handleHideAlbum = useCallback(async () => {
    if (!data || !artist.data) {
      return;
    }
    const album = data.releases.find((x) => x.id === menuTarget);
    if (!album) {
      return;
    }
    await hideAlbum(artist.data.artist, album);
  }, [artist.data, data, hideAlbum, menuTarget]);

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!data) {
      return;
    }
    const album = data.releases.find((x) => x.id === menuTarget);
    await playSwitch(button.action, { album, shuffle: button.shuffle });
  }, [data, menuTarget, playSwitch]);

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
    top = sessionStorage.getItem(id);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    return 0;
  };

  const itemHeight = ((width * 0.89) / grid.cols) + (settings.albumText ? 54 : 0);

  const refreshPage = useCallback(() => {
    queryClient.invalidateQueries([QueryKeys.ARTIST]);
    queryClient.invalidateQueries([QueryKeys.ARTIST_APPEARANCES]);
    queryClient.invalidateQueries([QueryKeys.ALBUM_TRACKS]);
    queryClient.invalidateQueries([QueryKeys.HISTORY]);
  }, [queryClient]);

  const artistContext = useMemo(() => ({
    artist: artist.data,
    filter,
    filters: data.filters,
    getFormattedTime,
    grid,
    handleContextMenu,
    isPlaying,
    library,
    menuTarget,
    navigate,
    nowPlaying,
    playArtist,
    playArtistRadio,
    playSwitch,
    recentFavorites: recentFavorites.data.slice(0, 5),
    refreshMetadata,
    refreshPage,
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
    grid,
    handleContextMenu,
    isPlaying,
    library,
    menuTarget,
    navigate,
    nowPlaying,
    playArtist,
    playArtistRadio,
    playSwitch,
    recentFavorites.data,
    refreshMetadata,
    refreshPage,
    setFilter,
    setSort,
    settings,
    sort,
    topTracks.data,
    width,
  ]);

  if (isEmpty(items) || !artist.data || !topTracks.data || !recentFavorites.data) {
    return null;
  }

  return (
    <Palette
      src={artist.data.artist.art || artist.data.artist.thumb}
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
            >
              <Virtuoso
                className="scroll-container"
                components={{
                  Footer,
                  Header,
                }}
                context={{ ...artistContext, colors: Object.values(colors) as string[] }}
                data={items}
                fixedItemHeight={itemHeight}
                increaseViewportBy={{ top: 0, bottom: 500 }}
                initialScrollTop={initialScrollTop()}
                isScrolling={handleScrollState}
                itemContent={(index, item, context) => RowContent({ index, item, context })}
                style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
                onScroll={(e) => {
                  const target = e.currentTarget as unknown as HTMLDivElement;
                  sessionStorage.setItem(
                    id,
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
              onClose={() => {
                menuSection.current = null;
                setMenuTarget(undefined);
                toggleMenu(false);
              }}
            >
              {albumButtons.map((button: ButtonSpecs) => (
                <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
                  {button.icon}
                  {button.name}
                </MenuItem>
              ))}
              {menuSection.current === 'Appears On' && (
              <>
                <MenuDivider />
                <MenuItem
                  style={{
                    '--menu-primary': theme.palette.error.main,
                    '--menu-transparent': `${theme.palette.error.main}cc`,
                  } as React.CSSProperties}
                  onClick={handleHideAlbum}
                >
                  <SvgIcon sx={{ mr: '8px' }}><MdMusicOff /></SvgIcon>
                  Hide album
                </MenuItem>
              </>
              )}
            </ControlledMenu>
          </>
        );
      }}
    </Palette>
  );
};

export default Artist;
