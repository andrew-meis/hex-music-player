import { List, ListItem, SvgIcon } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useCallback, useState } from 'react';
import { BsGrid } from 'react-icons/bs';
import { NavLink } from 'react-router-dom';
import { Playlist } from 'api/index';
import { PlaylistMenu } from 'components/menus';
import Tooltip from 'components/tooltip/Tooltip';
import usePlayback from 'hooks/usePlayback';
import { useLibrary } from 'queries/app-queries';
import { usePlaylists } from 'queries/playlist-queries';
import CompactPlaylist from './CompactPlaylist';

const listStyle = {
  width: 'auto',
  px: 0,
  py: '8px',
  ml: '6px',
  mr: '10px',
  mb: '2px',
  borderRadius: '8px',
  color: 'text.secondary',
  '&:hover': {
    backgroundColor: 'action.hover',
    color: 'text.primary',
  },
};

const activeStyle = {
  ...listStyle,
  backgroundColor: 'action.selected',
  color: 'text.primary',
  '&:hover': {
    backgroundColor: 'action.hoverSelected',
  },
};

const CompactPlaylists = () => {
  const library = useLibrary();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const [menuTarget, setMenuTarget] = useState<Playlist[]>([]);
  const { data: playlists } = usePlaylists(library);
  const { playSwitch } = usePlayback();

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    if (!playlists) return;
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(playlists
      .filter((playlist) => playlist)
      .filter((playlist) => playlist.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [playlists, toggleMenu]);

  return (
    <>
      <List
        disablePadding
        className="scroll-container"
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'overlay',
        }}
      >
        <NavLink end className="nav-link" to="/playlists">
          {({ isActive }) => (
            <Tooltip placement="right" title="All Playlists">
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <SvgIcon sx={{ mx: 'auto' }}><BsGrid /></SvgIcon>
              </ListItem>
            </Tooltip>
          )}
        </NavLink>
        {playlists!.map((playlist) => (
          <CompactPlaylist
            handleContextMenu={handleContextMenu}
            key={playlist.id}
            menuState={menuProps.state}
            menuTarget={menuTarget}
            playlist={playlist}
          />
        ))}
      </List>
      <PlaylistMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        playlists={menuTarget}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
          setMenuTarget([]);
        }}
        {...menuProps}
      />
    </>
  );
};

export default CompactPlaylists;
