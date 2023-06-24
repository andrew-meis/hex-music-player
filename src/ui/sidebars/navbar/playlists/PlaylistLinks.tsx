import {
  Box, Collapse, List, ListItem, Typography,
} from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useCallback, useState } from 'react';
import { BsGrid } from 'react-icons/bs';
import { FaCaretDown, FaCaretRight } from 'react-icons/fa';
import { TiFolder } from 'react-icons/ti';
import { NavLink } from 'react-router-dom';
import { Playlist } from 'api/index';
import { PlaylistMenu } from 'components/menus';
import { navlistTypeActiveStyle, navlistTypeStyle } from 'constants/style';
import usePlayback from 'hooks/usePlayback';
import { useLibrary } from 'queries/app-queries';
import { usePlaylists } from 'queries/playlist-queries';
import PlaylistLink from './PlaylistLink';

const listItemStyle = {
  width: 'auto',
  pl: '12px',
  py: 0,
  pr: '10px',
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

const activeBox = (isActive: boolean) => ({
  width: '4px',
  height: '18px',
  marginLeft: isActive ? '4px' : '0px',
  marginRight: isActive ? '4px' : '0px',
  backgroundColor: isActive ? 'primary.main' : 'transparent',
  borderRadius: '2px',
});

const PlaylistLinks = () => {
  const library = useLibrary();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const [menuTarget, setMenuTarget] = useState<Playlist[]>([]);
  const [open, setOpen] = useState(false);
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

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <List disablePadding className="scroll-container" sx={{ overflow: 'overlay', mr: '4px' }}>
        <NavLink end className="nav-link" to="/playlists">
          {({ isActive }) => (
            <ListItem sx={listItemStyle}>
              <Box sx={activeBox(isActive)} />
              <BsGrid
                style={{
                  color: isActive
                    ? 'var(--mui-palette-text-primary)'
                    : 'var(--mui-palette-text-secondary)',
                  marginRight: '6px',
                }}
              />
              <Typography sx={isActive ? navlistTypeActiveStyle : navlistTypeStyle}>
                All playlists
              </Typography>
            </ListItem>
          )}
        </NavLink>
        <ListItem sx={listItemStyle} onClick={handleOpen}>
          <Box sx={activeBox(false)} />
          <TiFolder style={{ marginRight: '6px' }} />
          <Typography sx={textStyle}>Smart playlists</Typography>
          <Box ml="auto">{open ? <FaCaretDown /> : <FaCaretRight />}</Box>
        </ListItem>
        <Collapse in={open} timeout="auto">
          {playlists!.map((playlist) => {
            if (!playlist.smart) {
              return null;
            }
            return (
              <PlaylistLink
                handleContextMenu={handleContextMenu}
                key={playlist.id}
                menuState={menuProps.state}
                menuTarget={menuTarget}
                playlist={playlist}
              />
            );
          })}
        </Collapse>
        {playlists!.map((playlist) => {
          if (playlist.smart) {
            return null;
          }
          return (
            <PlaylistLink
              handleContextMenu={handleContextMenu}
              key={playlist.id}
              menuState={menuProps.state}
              menuTarget={menuTarget}
              playlist={playlist}
            />
          );
        })}
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

export default PlaylistLinks;
