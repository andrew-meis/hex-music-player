import { Box, ListItem, Typography } from '@mui/material';
import { MenuState } from '@szhsin/react-menu';
import React, { useCallback } from 'react';
import { useDrop } from 'react-dnd';
import { NavLink } from 'react-router-dom';
import { Album, Artist, Playlist, PlaylistItem, PlayQueueItem, Track } from 'api/index';
import {
  navlistBoxStyle,
  navlistActiveBox,
  navlistTypeActiveStyle,
  navlistTypeStyle,
} from 'constants/style';
import { useAddToPlaylist } from 'hooks/playlistHooks';
import { DragTypes } from 'types/enums';

interface PlaylistLinkProps {
  handleContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void
  menuState: MenuState | undefined;
  menuTarget: Playlist[] | undefined;
  playlist: Playlist;
}

const PlaylistLink = ({
  handleContextMenu, menuState, menuTarget, playlist,
}: PlaylistLinkProps) => {
  const addToPlaylist = useAddToPlaylist();

  const handleDrop = useCallback(async (
    array: any[],
    itemType: null | string | symbol,
  ) => {
    if (itemType === DragTypes.PLAYLIST_ITEM || itemType === DragTypes.PLAYQUEUE_ITEM) {
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
      DragTypes.TRACK,
    ],
    drop: (
      item: Album[] | Artist[] | PlaylistItem[] | PlayQueueItem[] | Track[],
      monitor,
    ) => handleDrop(item, monitor.getItemType()),
    collect: (monitor) => ({ isOver: monitor.isOver() }),
  }), [playlist]);

  return (
    <Box data-id={playlist.id} onContextMenu={(event) => handleContextMenu(event)}>
      <NavLink
        className="nav-link"
        ref={!playlist.smart ? drop : null}
        to={`/playlists/${playlist.id}`}
      >
        {({ isActive }) => (
          <ListItem
            sx={{
              ...navlistBoxStyle,
              ml: playlist.smart ? '34px' : '12px',
              border: '1px solid',
              borderColor: isOver ? 'var(--mui-palette-primary-main)' : 'transparent',
              borderRadius: '4px',
            }}
          >
            <Box sx={navlistActiveBox(isActive)} />
            <Typography
              sx={isActive
                || (menuState === 'open' && !!menuTarget && menuTarget[0].id === playlist.id)
                ? navlistTypeActiveStyle
                : navlistTypeStyle}
            >
              {playlist.title}
            </Typography>
          </ListItem>
        )}
      </NavLink>
    </Box>
  );
};

export default React.memo(PlaylistLink);
