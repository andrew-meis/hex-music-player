import { Avatar, Box, ListItem, SvgIcon } from '@mui/material';
import { MenuState } from '@szhsin/react-menu';
import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { BsMusicNoteList } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import { Playlist, PlaylistItem, PlayQueueItem, Track } from 'api/index';
import Tooltip from 'components/tooltip/Tooltip';
import { useAddToPlaylist } from 'hooks/playlistHooks';
import { useThumbnail } from 'hooks/plexHooks';
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
  const [thumbSrc] = useThumbnail(playlist?.thumb || playlist?.composite || 'none', 100);
  const addToPlaylist = useAddToPlaylist();

  const handleDrop = useCallback(async (
    array: any[],
    itemType: null | string | symbol,
  ) => {
    let tracks;
    if (itemType === DragTypes.PLAYLIST_ITEM || itemType === DragTypes.PLAYQUEUE_ITEM) {
      tracks = array.map((item) => item.track) as Track[];
    } else {
      tracks = array as Track[];
    }
    await addToPlaylist(playlist.id, tracks.map((track) => track.id));
  }, [addToPlaylist, playlist.id]);

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      DragTypes.PLAYLIST_ITEM,
      DragTypes.PLAYQUEUE_ITEM,
      DragTypes.TRACK,
    ],
    drop: (
      item: PlaylistItem[] | PlayQueueItem[] | Track[],
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
          <Tooltip placement="right" title={playlist.title}>
            <ListItem
              disablePadding
              sx={{
                border: '1px solid',
                borderColor: isOver
                || isActive
                || (menuState === 'open' && !!menuTarget && menuTarget[0].id === playlist.id)
                  ? 'var(--mui-palette-primary-main)'
                  : 'transparent',
                borderRadius: '8px',
                margin: 'auto',
                width: 40,
                height: 40,
              }}
            >
              <Avatar
                src={thumbSrc}
                sx={{ borderRadius: '8px', margin: 'auto', width: 36, height: 36 }}
                variant="rounded"
              >
                <SvgIcon>
                  <BsMusicNoteList />
                </SvgIcon>
              </Avatar>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
    </Box>
  );
};

export default React.memo(CompactPlaylist);
