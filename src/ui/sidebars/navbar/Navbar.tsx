import {
  Box, ClickAwayListener, List, ListItem, ListSubheader, SvgIcon,
} from '@mui/material';
import React, { useState } from 'react';
import {
  HiMusicNote,
  IoMdMicrophone,
  IoMdPricetag,
  RiAlbumFill,
  TiChartLine,
} from 'react-icons/all';
import { HiHome } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import PlaylistLinks from './playlists/PlaylistLinks';
import PlaylistSubheader from './playlists/PlaylistSubheader';

const listStyle = {
  width: 'auto',
  px: 0,
  py: '6px',
  mx: '8px',
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

const activeBox = (isActive: boolean) => ({
  width: '4px',
  height: '18px',
  marginLeft: isActive ? '4px' : '0px',
  backgroundColor: isActive ? 'primary.main' : 'transparent',
  borderRadius: '2px',
});

const Navbar = () => {
  const [show, setShow] = useState(false);

  return (
    <>
      <nav>
        <List disablePadding>
          <NavLink className="nav-link" to="/">
            {({ isActive }) => (
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <Box sx={activeBox(isActive)} />
                <SvgIcon sx={{ mx: '8px' }}><HiHome /></SvgIcon>
                Home
              </ListItem>
            )}
          </NavLink>
          <NavLink className="nav-link" to="/charts">
            {({ isActive }) => (
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <Box sx={activeBox(isActive)} />
                <SvgIcon sx={{ mx: '8px' }}><TiChartLine /></SvgIcon>
                Charts
              </ListItem>
            )}
          </NavLink>
          <ListSubheader
            sx={{
              lineHeight: '20px',
              fontSize: '0.75rem',
              backgroundColor: 'transparent',
              marginTop: '8px',
            }}
          >
            Library
          </ListSubheader>
          <NavLink className="nav-link" to="/artists">
            {({ isActive }) => (
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <Box sx={activeBox(isActive)} />
                <SvgIcon sx={{ mx: '8px' }}><IoMdMicrophone /></SvgIcon>
                Artists
              </ListItem>
            )}
          </NavLink>
          <NavLink className="nav-link" to="/albums">
            {({ isActive }) => (
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <Box sx={activeBox(isActive)} />
                <SvgIcon sx={{ mx: '8px' }}><RiAlbumFill /></SvgIcon>
                Albums
              </ListItem>
            )}
          </NavLink>
          <NavLink className="nav-link" to="/tracks">
            {({ isActive }) => (
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <Box sx={activeBox(isActive)} />
                <SvgIcon sx={{ mx: '8px' }}><HiMusicNote /></SvgIcon>
                Tracks
              </ListItem>
            )}
          </NavLink>
          <NavLink className="nav-link" to="/genres">
            {({ isActive }) => (
              <ListItem sx={isActive ? activeStyle : listStyle}>
                <Box sx={activeBox(isActive)} />
                <SvgIcon sx={{ mx: '8px' }}><IoMdPricetag /></SvgIcon>
                Genres
              </ListItem>
            )}
          </NavLink>
        </List>
        <ClickAwayListener onClickAway={() => setShow(false)}>
          <Box>
            <PlaylistSubheader setShow={setShow} show={show} />
          </Box>
        </ClickAwayListener>
      </nav>
      <PlaylistLinks />
    </>
  );
};

export default Navbar;
