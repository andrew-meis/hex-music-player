import { Avatar, Box, ListItem, SvgIcon } from '@mui/material';
import { MenuState } from '@szhsin/react-menu';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDrop } from 'react-dnd';
import { BsMusicNoteList } from 'react-icons/bs';
import { NavLink } from 'react-router-dom';
import { Album, Artist, Playlist, PlaylistItem, PlayQueueItem, Track } from 'api/index';
import Tooltip from 'components/tooltip/Tooltip';
import { useAddToPlaylist } from 'hooks/playlistHooks';
import { useLibrary } from 'queries/app-queries';
import { DragTypes } from 'types/enums';

interface CompactPlaylistProps {
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
  menuState: MenuState | undefined;
  menuTarget: Playlist[] | undefined;
  playlist: Playlist;
}

const CompactPlaylist = ({
  handleContextMenu, menuState, menuTarget, playlist,
}: CompactPlaylistProps) => {
  const library = useLibrary();
  const [open, setOpen] = useState(false);
  const thumbSrc = useMemo(() => {
    if (!playlist || (!playlist.thumb && !playlist.composite)) return undefined;
    return library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: playlist.thumb || playlist.composite,
        width: 100,
        height: 100,
        minSize: 1,
        upscale: 1,
      },
    );
  }, [library, playlist]);
  const addToPlaylist = useAddToPlaylist();

  useEffect(() => {
    if (menuState === 'closing' || menuState === 'opening' || menuState === 'open') {
      setOpen(false);
    }
  }, [menuState, open]);

  const handleDrop = useCallback(async (
    array: any[],
    itemType: null | string | symbol,
  ) => {
    if (
      itemType === DragTypes.PLAYLIST_ITEM
      || itemType === DragTypes.PLAYQUEUE_ITEM
      || itemType === DragTypes.SMART_PLAYLIST_ITEM
    ) {
      await addToPlaylist(playlist.id, array.map((item) => item.track.id));
      return;
    }
    await addToPlaylist(playlist.id, array.map((item) => item.id));
  }, [addToPlaylist, playlist.id]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      DragTypes.ALBUM,
      DragTypes.ARTIST,
      DragTypes.PLAYLIST_ITEM,
      DragTypes.PLAYQUEUE_ITEM,
      DragTypes.SMART_PLAYLIST_ITEM,
      DragTypes.TRACK,
    ],
    drop: (
      item: Album[] | Artist[] | PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => handleDrop(item, monitor.getItemType()),
    collect: (monitor) => ({
      isOver: monitor.isOver(),
    }),
  }), [playlist]);

  return (
    <Box data-id={playlist.id} onContextMenu={(event) => handleContextMenu(event)}>
      <NavLink
        className="nav-link"
        ref={!playlist.smart ? drop : null}
        to={`/playlists/${playlist.id}`}
      >
        {({ isActive }) => (
          <Tooltip
            open={open || isOver}
            placement="right"
            title={playlist.title}
            onClose={() => setOpen(false)}
            onOpen={() => setOpen(true)}
          >
            <ListItem
              disablePadding
              sx={{
                ml: '6px',
                mr: '10px',
                width: 40,
                height: 44,
              }}
            >
              <Avatar
                src={thumbSrc}
                sx={{
                  borderRadius: '8px',
                  height: 40,
                  width: 40,
                }}
                variant="rounded"
              >
                <SvgIcon>
                  <BsMusicNoteList />
                </SvgIcon>
              </Avatar>
              <Box
                border="2px solid"
                borderColor={isOver
                || isActive
                || (menuState === 'open' && !!menuTarget && menuTarget[0].id === playlist.id)
                  ? 'var(--mui-palette-primary-main)'
                  : 'transparent'}
                borderRadius="8px"
                height={36}
                left={0}
                position="absolute"
                top={2}
                width={36}
              />
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
    </Box>
  );
};

export default React.memo(CompactPlaylist);
