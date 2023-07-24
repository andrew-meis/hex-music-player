import { SvgIcon } from '@mui/material';
import { MenuDivider, MenuItem } from '@szhsin/react-menu';
import { motion } from 'framer-motion';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEmpty } from 'lodash';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { MdDelete } from 'react-icons/md';
import { useLocation, useNavigationType, useParams } from 'react-router-dom';
import { Album, Artist, PlayQueueItem, PlaylistItem, Track } from 'api/index';
import { useAddToPlaylist, useMovePlaylistItems, useRemoveFromPlaylist } from 'hooks/playlistHooks';
import usePlayback from 'hooks/usePlayback';
import useToast from 'hooks/useToast';
import { usePlaylist, usePlaylistItems } from 'queries/playlist-queries';
import { libraryAtom } from 'root/Root';
import mergeRefs from 'scripts/merge-refs';
import { DragTypes, PlayActions } from 'types/enums';
import { AppTrackViewSettings, RouteParams } from 'types/interfaces';
import { isPlaylistItem } from 'types/type-guards';
import { tableKeyAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import Header from './Header';
import Subheader from './Subheader';
import TrackTable from './TrackTable';

const defaultViewSettings: AppTrackViewSettings = {
  columns: {
    grandparentTitle: false,
    lastViewedAt: false,
    originalTitle: false,
    parentTitle: false,
    parentYear: false,
    thumb: true,
    viewCount: false,
  },
  compact: false,
  multiLineRating: true,
  multiLineTitle: true,
};

const Playlist = () => {
  const viewSettings = window.electron.readConfig('playlist-view-settings') as AppTrackViewSettings;
  const { id } = useParams<keyof RouteParams>() as RouteParams;

  const addToPlaylist = useAddToPlaylist();
  const library = useAtomValue(libraryAtom);
  const location = useLocation();
  const move = useMovePlaylistItems();
  const navigationType = useNavigationType();
  const playlist = usePlaylist(+id, library);
  const playlistItems = usePlaylistItems(+id, library);
  const removeFromPlaylist = useRemoveFromPlaylist();
  const setTableKey = useSetAtom(tableKeyAtom);
  const toast = useToast();
  const [filter, setFilter] = useState('');
  const [scrollRef, setScrollRef] = useState<HTMLDivElement | null>(null);
  const { playSwitch } = usePlayback();

  useEffect(() => {
    setTableKey('playlist');
    return () => setTableKey('');
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const items = useMemo(() => {
    if (!playlistItems.data) {
      return [];
    }
    if (filter !== '') {
      return playlistItems.data.filter(
        (item) => item.track.title?.toLowerCase().includes(filter.toLowerCase())
        || item.track.grandparentTitle?.toLowerCase().includes(filter.toLowerCase())
        || item.track.originalTitle?.toLowerCase().includes(filter.toLowerCase())
        || item.track.parentTitle?.toLowerCase().includes(filter.toLowerCase()),
      );
    }
    return playlistItems.data;
  }, [filter, playlistItems.data]);

  const handleDrop = useCallback(async (
    array: any[],
    itemType: null | string | symbol,
  ) => {
    if (itemType === DragTypes.PLAYQUEUE_ITEM) {
      await addToPlaylist(+id, array.map((item) => item.track.id));
      return;
    }
    await addToPlaylist(+id, array.map((item) => item.id));
  }, [addToPlaylist, id]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      DragTypes.ALBUM,
      DragTypes.ARTIST,
      DragTypes.PLAYQUEUE_ITEM,
      DragTypes.TRACK,
    ],
    canDrop: () => !playlist.data?.smart,
    drop: (
      item: Album[] | Artist[] | PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => handleDrop(item, monitor.getItemType()),
    collect: (monitor) => ({ isOver: (monitor.isOver() && !playlist.data?.smart) }),
  }), [playlist.data]);

  const handlePlayNow = useCallback(async (
    key?: string,
    shuffle?: boolean,
    sortedItems?: PlaylistItem[],
  ) => {
    if (filter === '' && (!sortedItems || isEmpty(sortedItems))) {
      playSwitch(PlayActions.PLAY_PLAYLIST, { key, playlist: playlist.data, shuffle });
      return;
    }
    if (!sortedItems || isEmpty(sortedItems)) {
      const tracks = items.map(({ track }) => track);
      playSwitch(PlayActions.PLAY_TRACKS, { key, tracks, shuffle });
      return;
    }
    const tracks = sortedItems.map(({ track }) => track);
    playSwitch(PlayActions.PLAY_TRACKS, { key, tracks, shuffle });
  }, [filter, items, playSwitch, playlist.data]);

  const handleRemove = useCallback((selectedItems: (Track | PlaylistItem)[]) => {
    if (!selectedItems.every((item): item is PlaylistItem => isPlaylistItem(item))) return;
    if (playlist.data?.smart) {
      toast({ type: 'error', text: 'Cannot edit smart playlist' });
      return;
    }
    selectedItems.forEach((item) => {
      removeFromPlaylist(item.playlistId, item.id);
    });
  }, [playlist.data?.smart, removeFromPlaylist, toast]);

  const additionalMenuOptions = useCallback((selectedItems: (Track | PlaylistItem)[]) => (
    <>
      <MenuDivider />
      <MenuItem
        className="error"
        onClick={() => handleRemove(selectedItems)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdDelete /></SvgIcon>
        Remove
      </MenuItem>
    </>
  ), [handleRemove]);

  const handleTrackDrop = useCallback(async (droppedItems: PlaylistItem[], prevId?: number) => {
    await move(
      +id,
      droppedItems.map((droppedItem) => droppedItem.id),
      prevId === Infinity ? playlistItems.data?.slice(-1)[0].id : prevId,
    );
  }, [id, move, playlistItems.data]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`playlist-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `playlist-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  if (playlist.isLoading || playlistItems.isLoading || !playlist.data) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="scroll-container"
      data-is-over={isOver}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      ref={mergeRefs(drop, setScrollRef)}
      style={{ height: '100%', overflow: 'overlay' }}
      onAnimationComplete={() => scrollRef?.scrollTo({ top: initialScrollTop })}
      onScroll={(e) => {
        const target = e.currentTarget as unknown as HTMLDivElement;
        sessionStorage.setItem(
          `playlist-scroll ${id}`,
          target.scrollTop as unknown as string,
        );
      }}
    >
      <Header
        handlePlayNow={handlePlayNow}
        playlist={playlist.data}
      />
      <Subheader
        filter={filter}
        playlist={playlist.data}
        setFilter={setFilter}
      />
      <TrackTable
        additionalMenuOptions={playlist.data.smart ? undefined : additionalMenuOptions}
        columnOptions={
          isEmpty(viewSettings.columns)
            ? defaultViewSettings.columns
            : viewSettings.columns
        }
        isViewCompact={
          typeof viewSettings.compact !== 'undefined'
            ? viewSettings.compact
            : defaultViewSettings.compact
        }
        library={library}
        multiLineRating={
          typeof viewSettings.multiLineRating !== 'undefined'
            ? viewSettings.multiLineRating
            : defaultViewSettings.multiLineRating
        }
        playbackFn={handlePlayNow}
        rows={items}
        scrollRef={scrollRef}
        subtextOptions={{
          albumTitle: true,
          artistTitle: true,
          showSubtext: typeof viewSettings.multiLineTitle !== 'undefined'
            ? viewSettings.multiLineTitle
            : defaultViewSettings.multiLineTitle,
        }}
        trackDropFn={handleTrackDrop}
        onDeleteKey={handleRemove}
      />
    </motion.div>
  );
};

export default Playlist;
