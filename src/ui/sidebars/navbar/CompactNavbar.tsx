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

const CompactNavbar = () => (
  <nav style={{ height: '100%' }}>
    <List disablePadding sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <NavLink className="nav-link" to="/">
        {({ isActive }) => (
          <Tooltip placement="right" title="Home">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: 'auto' }}><HiHome /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/charts">
        {({ isActive }) => (
          <Tooltip placement="right" title="Charts">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: 'auto' }}><TiChartLine /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <Box
        borderTop="1px solid"
        height="1px"
        mb="4px"
        ml="6px"
        mr="10px"
        mt="2px"
        sx={{
          borderTopColor: 'border.main',
        }}
        width="40px"
      />
      <NavLink className="nav-link" to="/artists">
        {({ isActive }) => (
          <Tooltip placement="right" title="Artists">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: 'auto' }}><IoMdMicrophone /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/albums">
        {({ isActive }) => (
          <Tooltip placement="right" title="Albums">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: 'auto' }}><RiAlbumFill /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/tracks">
        {({ isActive }) => (
          <Tooltip placement="right" title="Tracks">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: 'auto' }}><BsMusicNote /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <NavLink className="nav-link" to="/genres">
        {({ isActive }) => (
          <Tooltip placement="right" title="Genres">
            <ListItem sx={isActive ? activeStyle : listStyle}>
              <SvgIcon sx={{ mx: 'auto' }}><FaTags /></SvgIcon>
            </ListItem>
          </Tooltip>
        )}
      </NavLink>
      <Box
        borderTop="1px solid"
        height="1px"
        mb="4px"
        ml="6px"
        mr="10px"
        mt="2px"
        sx={{
          borderTopColor: 'border.main',
        }}
        width="40px"
      />
      <CompactPlaylists />
    </List>
  </nav>
);

export default CompactNavbar;
