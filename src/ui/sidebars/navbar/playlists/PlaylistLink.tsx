import { Box, ListItem, Typography } from '@mui/material';
import { MenuState } from '@szhsin/react-menu';
import { Playlist, PlayQueueItem, Track } from 'hex-plex';
import React from 'react';
import { useDrop } from 'react-dnd';
import { NavLink } from 'react-router-dom';
import { useAddToPlaylist } from '../../../../hooks/plexHooks';
import { DragActions } from '../../../../types/enums';
import { isPlayQueueItem, isTrack } from '../../../../types/type-guards';

const listItemStyle = {
  width: 'auto',
  py: 0,
  px: 0,
  mr: '10px',
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
  },
};

const textStyle = {
  WebkitLineClamp: 1,
  display: '-webkit-box',
  overflow: 'hidden',
  WebkitBoxOrient: 'vertical',
  fontSize: '0.92rem',
  py: '0px',
  lineHeight: '1.9rem',
  letterSpacing: '0.01rem',
};

const activeStyle = {
  ...textStyle,
  color: 'text.primary',
  fontWeight: 700,
};

const activeBox = (isActive: boolean) => ({
  width: '4px',
  height: '18px',
  marginLeft: isActive ? '4px' : '0px',
  marginRight: isActive ? '4px' : '0px',
  backgroundColor: isActive ? 'primary.main' : 'transparent',
  borderRadius: '2px',
});

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
      await item.forEach((track) => {
        addToPlaylist(playlist.id, track.key);
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
              ...listItemStyle,
              ml: playlist.smart ? '34px' : '12px',
              border: '1px solid',
              borderColor: isOver ? 'tomato' : 'transparent',
              borderRadius: '4px',
            }}
          >
            <Box sx={activeBox(isActive)} />
            <Typography
              sx={isActive || (menuState === 'open' && menuTarget === playlist.id)
                ? activeStyle
                : textStyle}
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
