import { Box, ListItem, Typography } from '@mui/material';
import { MenuState } from '@szhsin/react-menu';
import { Playlist, PlayQueueItem, Track } from 'hex-plex';
import React from 'react';
import { useDrop } from 'react-dnd';
import { NavLink } from 'react-router-dom';
import {
  navlistBoxStyle,
  navlistActiveBox,
  navlistTypeActiveStyle,
  navlistTypeStyle,
} from 'constants/style';
import { useAddToPlaylist } from 'hooks/playlistHooks';
import { DragActions } from 'types/enums';
import { isPlayQueueItem, isTrack } from 'types/type-guards';

interface PlaylistLinkProps {
  handleContextMenu: (event: React.MouseEvent) => void;
  menuState: MenuState | undefined;
  menuTarget: number | undefined;
  playlist: Playlist;
}

const PlaylistLink = ({
  handleContextMenu, menuState, menuTarget, playlist,
}: PlaylistLinkProps) => {
  const addToPlaylist = useAddToPlaylist();

  const handleDrop = async (item: PlayQueueItem | Track | Track[]) => {
    if (Array.isArray(item)) {
      item.forEach(async (track) => {
        await addToPlaylist(playlist.id, track.key);
      });
      return;
    }
    if (isTrack(item)) {
      await addToPlaylist(playlist.id, item.key);
      return;
    }
    if (isPlayQueueItem(item)) {
      await addToPlaylist(playlist.id, item.track.key);
    }
  };

  const [{ isOver }, drop] = useDrop(() => ({
    accept: [
      DragActions.COPY_TRACK,
      DragActions.COPY_TRACKS,
      DragActions.MOVE_TRACK,
      DragActions.MOVE_TRACKS,
    ],
    drop: (item: PlayQueueItem | Track | Track[]) => handleDrop(item),
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
          <ListItem
            sx={{
              ...navlistBoxStyle,
              ml: playlist.smart ? '34px' : '12px',
              border: '1px solid',
              borderColor: isOver ? 'var(--mui-palette-info-main)' : 'transparent',
              borderRadius: '4px',
            }}
          >
            <Box sx={navlistActiveBox(isActive)} />
            <Typography
              sx={isActive || (menuState === 'open' && menuTarget === playlist.id)
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
