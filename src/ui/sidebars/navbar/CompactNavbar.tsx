import {
  Box,
  List, ListItem, SvgIcon,
} from '@mui/material';
import {
  BsMusicNote,
  IoMdMicrophone,
  FaTags,
  RiAlbumFill,
  TiChartLine,
} from 'react-icons/all';
import { HiHome } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import Tooltip from 'components/tooltip/Tooltip';
import CompactPlaylists from './compact-playlists/CompactPlaylists';

const listStyle = {
  width: 'auto',
  px: 0,
  py: '6px',
  ml: '10px',
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

const CompactNavbar = () => (
  <nav style={{ height: '100%' }}>
    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavLink className="nav-link" to="/">
        {({ isActive }) => (
          <Tooltip placement="right" title="Home">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: '6px' }}><HiHome /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/charts">
        {({ isActive }) => (
          <Tooltip placement="right" title="Charts">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: '6px' }}><TiChartLine /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <Box
        borderTop="1px solid"
        height="1px"
        ml="auto"
        mr="8px"
        my="10px"
        sx={{
          borderTopColor: 'border.main',
        }}
        width="36px"
      />
      <NavLink className="nav-link" to="/artists">
        {({ isActive }) => (
          <Tooltip placement="right" title="Artists">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: '6px' }}><IoMdMicrophone /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/albums">
        {({ isActive }) => (
          <Tooltip placement="right" title="Albums">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: '6px' }}><RiAlbumFill /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/tracks">
        {({ isActive }) => (
          <Tooltip placement="right" title="Tracks">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: '6px' }}><BsMusicNote /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/genres">
        {({ isActive }) => (
          <Tooltip placement="right" title="Genres">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: '6px' }}><FaTags /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <Box
        borderTop="1px solid"
        height="1px"
        ml="auto"
        mr="8px"
        my="10px"
        sx={{
          borderTopColor: 'border.main',
        }}
        width="36px"
      />
      <CompactPlaylists />
    </List>
  </nav>
);

export default CompactNavbar;
