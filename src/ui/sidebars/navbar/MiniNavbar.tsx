import {
  Box,
  List, ListItem, SvgIcon,
} from '@mui/material';
import React from 'react';
import {
  HiHome,
  HiMusicNote,
  IoGlobeSharp,
  IoMdMicrophone,
  IoSettingsSharp,
  RiAlbumFill,
  TbPlaylist,
  TiChartLine,
} from 'react-icons/all';
import { NavLink } from 'react-router-dom';

const listStyle = {
  width: 'auto',
  px: 0,
  py: '6px',
  ml: '8px',
  mr: '4px',
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
};

const MiniNavbar = () => {
  return (
    <nav style={{ height: '100%' }}>
      <List disablePadding sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <NavLink className="nav-link" to="/">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Home">
              <SvgIcon sx={{ mx: '8px' }}><HiHome /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <NavLink className="nav-link" to="/">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Charts">
              <SvgIcon sx={{ mx: '8px' }}><TiChartLine /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <Box
          borderTop="1px solid"
          height="1px"
          ml="auto"
          mr="6px"
          my="10px"
          sx={{
            borderTopColor: 'border.main',
          }}
          width="36px"
        />
        <NavLink className="nav-link" to="/artists">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Artists">
              <SvgIcon sx={{ mx: '8px' }}><IoMdMicrophone /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <NavLink className="nav-link" to="/albums">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Albums">
              <SvgIcon sx={{ mx: '8px' }}><RiAlbumFill /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <NavLink className="nav-link" to="/tracks">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Tracks">
              <SvgIcon sx={{ mx: '8px' }}><HiMusicNote /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <NavLink className="nav-link" to="/genres">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Genres">
              <SvgIcon sx={{ mx: '8px' }}><IoGlobeSharp /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <NavLink className="nav-link" to="/playlists">
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Playlists">
              <SvgIcon sx={{ mx: '8px' }}><TbPlaylist /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
        <NavLink
          className="nav-link"
          style={{ marginTop: 'auto' }}
          to="/settings"
        >
          {({ isActive }) => (
            <ListItem sx={isActive ? activeStyle : listStyle} title="Settings">
              <SvgIcon sx={{ mx: '8px' }}><IoSettingsSharp /></SvgIcon>
            </ListItem>
          )}
        </NavLink>
      </List>
    </nav>
  );
};

export default MiniNavbar;
