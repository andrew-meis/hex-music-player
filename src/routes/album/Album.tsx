import { Skeleton } from '@mui/lab';
import { Box, ClickAwayListener, Typography } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { Artist, Album as AlbumType, Library, Playlist, PlayQueueItem, Track } from 'hex-plex';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { ConnectDragSource, useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { NavigateFunction, useLocation, useNavigate, useParams } from 'react-router-dom';
import { ItemProps, ListProps, Virtuoso } from 'react-virtuoso';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import {
  useAlbum, useAlbumTracks, useIsPlaying, useLibrary, useNowPlaying,
} from '../../hooks/queryHooks';
import useFormattedTime from '../../hooks/useFormattedTime';
import useMenuStyle from '../../hooks/useMenuStyle';
import usePlayback from '../../hooks/usePlayback';
import useRowSelect from '../../hooks/useRowSelect';
import { DragActions } from '../../types/enums';
import { DiscHeader, RouteParams } from '../../types/interfaces';
import { isDiscHeader, isTrack } from '../../types/type-guards';
import GroupRow from './GroupRow';
import Header from './Header';
import Row from './Row';

const mergeRefs = (...refs: any) => {
  const filteredRefs = refs.filter(Boolean);
  if (!filteredRefs.length) return null;
  if (filteredRefs.length === 0) return filteredRefs[0];
  return (inst: Element) => {
    // eslint-disable-next-line no-restricted-syntax
    for (const ref of filteredRefs) {
      if (typeof ref === 'function') {
        ref(inst);
      } else if (ref) {
        ref.current = inst;
      }
    }
  };
};

const Item = React
  .forwardRef((
    {
      // @ts-ignore
      style, children, context, ...props
    }: ItemProps,
    itemRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <div
      {...props}
      ref={itemRef}
      style={style}
      onContextMenu={(event) => context.handleContextMenu(event)}
    >
      {children}
    </div>
  ));

const List = React
  .forwardRef((
    // @ts-ignore
    { style, children, context }: ListProps,
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => (
    <ClickAwayListener onClickAway={context.handleClickAway}>
      <Box
        className="list-box"
        ref={mergeRefs(context.drag, listRef)}
        style={{ ...style, maxWidth: '900px', width: '89%' }}
        sx={{ mx: 'auto' }}
        onDragStartCapture={context.handleDragStart}
      >
        {children}
      </Box>
    </ClickAwayListener>
  ));

const ScrollSeekPlaceholder = ({ height }: { height: number }) => (
  <Box alignItems="center" display="flex" height={height}>
    <Box width="50px" />
    <Box flexGrow={1} width="50%">
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="40%" />
    </Box>
    <Box mx="5px">
      <Skeleton variant="text" width="80px" />
    </Box>
    <Box width="50px">
      <Skeleton variant="text" width="50px" />
    </Box>
    <Box width="10px" />
  </Box>
);

const previewOptions = {
  offsetX: -8,
};

export interface AlbumContext {
  album: {album: AlbumType, related: (Playlist | Track | AlbumType | Artist)[]} | undefined;
  drag: ConnectDragSource,
  getFormattedTime: (inMs: number) => string;
  handleClickAway: () => void;
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  handleDragStart: (event: React.DragEvent<HTMLDivElement>) => void;
  handleRowClick: (event: React.MouseEvent, index: number) => void;
  hoverIndex: React.MutableRefObject<number | null>;
  isPlaying: boolean;
  library: Library;
  navigate: NavigateFunction;
  nowPlaying: PlayQueueItem | undefined;
  playAlbumAtTrack: (track: Track, shuffle?: boolean) => Promise<void>;
  selectedRows: number[];
}

export interface GroupRowProps {
  index: number;
  item: DiscHeader;
  context: AlbumContext;
}

export interface RowProps {
  index: number;
  item: Track;
  context: AlbumContext;
}

const GroupRowContent = (props: GroupRowProps) => <GroupRow {...props} />;
const RowContent = (props: RowProps) => <Row {...props} />;

const Album = () => {
  // data loading
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const album = useAlbum(+id);
  const albumTracks = useAlbumTracks(+id);
  const discRows = useMemo(
    // eslint-disable-next-line no-underscore-dangle
    () => albumTracks.data?.flatMap((item, i) => (item._type === 'discHeader' ? i : [])),
    [albumTracks.data],
  );
  // other hooks
  const hoverIndex = useRef<number | null>(null);
  const library = useLibrary();
  const location = useLocation();
  const menuStyle = useMenuStyle();
  const navigate = useNavigate();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { playAlbumAtTrack, playSwitch } = usePlayback();
  const {
    selectedRows, setSelectedRows, handleClickAway, handleRowClick
  } = useRowSelect([], discRows);

  useLayoutEffect(() => {
    setSelectedRows([]);
  }, [id, setSelectedRows]);

  const [, drag, dragPreview] = useDrag(() => ({
    previewOptions,
    type: selectedRows.length > 1 ? DragActions.COPY_TRACKS : DragActions.COPY_TRACK,
    item: () => {
      if (selectedRows.length === 1) {
        return albumTracks.data![selectedRows[0]];
      }
      return selectedRows.map((n) => albumTracks.data![n]);
    },
  }), [albumTracks.data, selectedRows]);

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
    if (discRows && discRows.includes(targetIndex)) {
      return;
    }
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
  }, [discRows, selectedRows, setSelectedRows, toggleMenu]);

  const handleMenuSelection = async (button: ButtonSpecs) => {
    if (!albumTracks.data) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => albumTracks.data[n]);
      if (isDiscHeader(track)) {
        return;
      }
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const tracks = selectedRows.map((n) => albumTracks.data[n]);
      if (tracks.every((item) => isTrack(item))) {
        // @ts-ignore
        await playSwitch(button.action, { tracks, shuffle: button.shuffle });
      }
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

  const albumContext = useMemo(() => ({
    album: album.data,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDragStart,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    navigate,
    nowPlaying,
    playAlbumAtTrack,
    selectedRows,
  }), [
    album.data,
    drag,
    getFormattedTime,
    handleClickAway,
    handleContextMenu,
    handleDragStart,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    navigate,
    nowPlaying,
    playAlbumAtTrack,
    selectedRows,
  ]);

  if (album.isLoading || albumTracks.isLoading) {
    return null;
  }

  if (!album.data || albumTracks.data!.length === 0) {
    return (
      <Typography color="text.primary" variant="h5">
        Empty album!
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
            Header,
            Item,
            List,
            ScrollSeekPlaceholder,
          }}
          context={albumContext}
          data={albumTracks.data}
          fixedItemHeight={56}
          isScrolling={handleScrollState}
          itemContent={(index, item, context) => {
            if (isTrack(item)) {
              return RowContent({ index, item, context });
            }
            return GroupRowContent({ index, item, context });
          }}
          scrollSeekConfiguration={{
            enter: (velocity) => Math.abs(velocity) > 700,
            exit: (velocity) => Math.abs(velocity) < 100,
          }}
          style={{ overflowY: 'overlay' } as unknown as React.CSSProperties}
          totalCount={albumTracks.data!.length}
          onScroll={(e) => {
            sessionStorage.setItem(
              id,
              (e.currentTarget as unknown as HTMLElement).scrollTop as unknown as string,
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

export default Album;
