import { SvgIcon, useTheme } from '@mui/material';
import { ControlledMenu, MenuDivider, MenuItem, useMenuState } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { Palette } from 'color-thief-react';
import { Album, Artist as ArtistType, Hub, Library, Track } from 'hex-plex';
import { isEmpty, throttle } from 'lodash';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import { MdMusicOff } from 'react-icons/all';
import {
  Location, NavigateFunction, useLocation, useNavigate, useOutletContext, useParams,
} from 'react-router-dom';
import { GroupedVirtuoso, TopItemListProps } from 'react-virtuoso';
import { motion } from 'framer-motion';
import { albumButtons, ButtonSpecs } from '../../constants/buttons';
import {
  useArtist, useArtistAppearances, useArtistTracks, useLibrary, useSettings,
} from '../../hooks/queryHooks';
import useFormattedTime from '../../hooks/useFormattedTime';
import useHideAlbum from '../../hooks/useHideAlbum';
import useMenuStyle from '../../hooks/useMenuStyle';
import usePlayback, { PlayParams } from '../../hooks/usePlayback';
import { PlayActions } from '../../types/enums';
import { AppSettings, RouteParams } from '../../types/interfaces';
import AlbumsRow from './AlbumsRow';
import Header from './Header';
import GroupRow from './GroupRow';

const TopItemList = React
  .forwardRef((
    {
      // @ts-ignore
      style, children, ...props
    }: TopItemListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      {...props}
      ref={listRef}
      style={{ ...style, position: 'relative' }}
    >
      {children}
    </div>
  ));

interface LocationWithState extends Location {
  state: { guid: ArtistType['guid'], title: ArtistType['title'] }
}

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

export interface ArtistRow {
  _type: string;
  albums: Album[];
  grid: { cols: number };
  section: string;
  artist: ArtistType;
}

export interface ArtistItems {
  rows?: ArtistRow[];
  groups?: ArtistGroup[];
  groupCounts?: number[];
}

export interface ArtistContext {
  artist: { albums: Album[], artist: ArtistType, hubs: Hub[] } | undefined;
  colors: string[] | undefined;
  getFormattedTime: (inMs: number) => string;
  grid: { cols: number };
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
  items: ArtistItems;
  library: Library;
  menuTarget: number | undefined;
  navigate: NavigateFunction;
  playArtist: (artist: ArtistType, shuffle?: boolean) => Promise<void>;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  settings: AppSettings;
  topTracks: Track[] | undefined;
  width: number;
}

export interface RowProps {
  index: number;
  context: ArtistContext;
}

const AlbumsRowContent = (props: RowProps) => <AlbumsRow {...props} />;
const GroupRowContent = (props: RowProps) => <GroupRow {...props} />;

const Artist = () => {
  // data loading
  const location = useLocation() as LocationWithState;
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const artist = useArtist(+id);
  const appearances = useArtistAppearances(+id, location.state.title, location.state.guid);
  const topTracks = useArtistTracks(+id, location.state.title, location.state.guid, 5);
  // other hooks
  const hideAlbum = useHideAlbum();
  const library = useLibrary();
  const menuSection = useRef<string | null>();
  const menuStyle = useMenuStyle();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const theme = useTheme();
  const topMostGroup = useRef<ArtistGroup | null>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuTarget, setmenuTarget] = useState<number | undefined>();
  const [menuProps, toggleMenu] = useMenuState();
  const { data: settings } = useSettings();
  const { getFormattedTime } = useFormattedTime();
  const { playArtist, playSwitch } = usePlayback();
  const { width } = useOutletContext() as { width: number };
  // create array for virtualization
  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => (
    {
      cols: throttledCols() as number,
    }
  ), [throttledCols]);
  const items = useMemo(() => {
    if (!artist.data || !appearances.data) {
      return {};
    }
    const rows = [];
    const groups = [];
    const groupCounts = [];
    if (artist.data.albums.length > 0) {
      let count = 0;
      groups.push({ _type: 'subheaderText', identifier: 'albums', text: 'Albums' });
      for (let i = 0; i < artist.data.albums.length; i += grid.cols) {
        const row = artist.data.albums.slice(i, i + grid.cols);
        rows.push({
          _type: 'albums', albums: row, grid, section: 'Albums', artist: artist.data.artist,
        });
        count += 1;
      }
      groupCounts.push(count);
    }
    artist.data.hubs.forEach((hub) => {
      if (hub.type === 'album' && hub.size > 0) {
        let count = 0;
        const identifier = hub.hubIdentifier.substring(14);
        groups.push({ _type: 'subheaderText', identifier, text: hub.title });
        for (let i = 0; i < hub.items.length; i += grid.cols) {
          const row = hub.items.slice(i, i + grid.cols);
          rows.push({
            _type: 'albums', albums: row, grid, section: hub.title, artist: artist.data.artist,
          });
          count += 1;
        }
        groupCounts.push(count);
      }
    });
    if (appearances.data.length > 0) {
      let count = 0;
      groups.push({ _type: 'subheaderText', identifier: 'appears', text: 'Appears On' });
      for (let i = 0; i < appearances.data.length; i += grid.cols) {
        const row = appearances.data.slice(i, i + grid.cols);
        rows.push({
          _type: 'albums', albums: row, grid, section: 'Appears On', artist: artist.data.artist,
        });
        count += 1;
      }
      groupCounts.push(count);
    }
    return { rows, groups, groupCounts };
  }, [appearances.data, artist.data, grid]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    const section = event.currentTarget.getAttribute('data-section');
    if (!target || !section) {
      return;
    }
    menuSection.current = section;
    setmenuTarget(parseInt(target, 10));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [toggleMenu]);

  const handleHideAlbum = useCallback(async () => {
    if (!items || !artist.data) {
      return;
    }
    const [albumRow] = items.rows!
      .filter((row) => row.albums.some((x) => x.id === menuTarget));
    const album = albumRow.albums.find((y) => y.id === menuTarget);
    if (!album) {
      return;
    }
    await hideAlbum(artist.data.artist, album);
  }, [artist.data, hideAlbum, items, menuTarget]);

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!items) {
      return;
    }
    const [albumRow] = items.rows!
      .filter((row) => row.albums.some((x) => x.id === menuTarget));
    const album = albumRow.albums.find((y) => y.id === menuTarget);
    await playSwitch(button.action, { album, shuffle: button.shuffle });
  }, [items, menuTarget, playSwitch]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  const artistContext = useMemo(() => ({
    artist: artist.data,
    getFormattedTime,
    grid,
    handleContextMenu,
    items,
    library,
    menuTarget,
    navigate,
    playArtist,
    playSwitch,
    settings,
    topTracks: topTracks.data,
    width,
  }), [
    artist.data,
    getFormattedTime,
    grid,
    handleContextMenu,
    items,
    library,
    menuTarget,
    navigate,
    playArtist,
    playSwitch,
    settings,
    topTracks.data,
    width,
  ]);

  if (isEmpty(items) || !artist.data || !topTracks.data) {
    return null;
  }

  return (
    <Palette
      colorCount={artist.data.artist.genre.length + 3}
      crossOrigin="anonymous"
      format="hex"
      src={library.api.getAuthenticatedUrl(artist.data.artist.art || artist.data.artist.thumb)}
    >
      {({ data: colors, loading, error }) => {
        if (loading) {
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
              <GroupedVirtuoso
                className="scroll-container"
                components={{
                  TopItemList,
                  Header,
                }}
                context={{ ...artistContext, colors }}
                groupContent={(index) => GroupRowContent(
                  { index, context: { ...artistContext, colors } },
                )}
                groupCounts={items.groupCounts}
                increaseViewportBy={{ top: 0, bottom: 200 }}
                isScrolling={handleScrollState}
                itemContent={
                  (index, groupIndex, item, context) => AlbumsRowContent({ index, context })
                }
                itemsRendered={(list) => {
                  // @ts-ignore
                  const renderedGroupIndices = (list).map((listEl) => listEl.groupIndex);
                  if (topMostGroup.current !== items.groups[renderedGroupIndices[0]]) {
                    queryClient
                      .setQueryData(['header-text'], items.groups[renderedGroupIndices[0]]?.text);
                    topMostGroup.current = items.groups[renderedGroupIndices[0]];
                  }
                }}
                style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
              />
            </motion.div>
            <ControlledMenu
              {...menuProps}
              portal
              anchorPoint={anchorPoint}
              menuStyle={menuStyle}
              onClose={() => {
                menuSection.current = null;
                setmenuTarget(undefined);
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
