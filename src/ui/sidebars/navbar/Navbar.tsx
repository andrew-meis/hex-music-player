import {
  Box, ClickAwayListener, List, ListItem, ListSubheader, Slide, SvgIcon,
} from '@mui/material';
import React, { useRef, useState } from 'react';
import {
  BiChevronRight,
  BsMusicNote,
  IoMdMicrophone,
  FaTags,
  RiAlbumFill,
  TiChartLine,
} from 'react-icons/all';
import { HiHome } from 'react-icons/hi';
import { NavLink } from 'react-router-dom';
import Navlist from './navlist/Navlist';
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
    '& .listsvg': {
      opacity: 1,
    },
  },
};

const activeStyle = {
  ...listStyle,
  backgroundColor: 'action.selected',
  color: 'text.primary',
};

const svgStyle = {
  ml: 'auto',
  mr: '4px',
  opacity: 0,
  transition: 'transform 200ms ease-in-out',
  '&:hover': {
    color: 'primary.main',
    transform: 'scale(1.3)',
  },
};

const activeBox = (isActive: boolean) => ({
  width: '4px',
  height: '18px',
  marginLeft: isActive ? '4px' : '0px',
  backgroundColor: isActive ? 'primary.main' : 'transparent',
  borderRadius: '2px',
});

const Navbar = () => {
  const hoverRow = useRef<string>('');
  const slideContainer = useRef<HTMLDivElement>(null);
  const [list, setList] = useState('artists');
  const [show, setShow] = useState(false);
  const [index, setIndex] = useState(0);

  const handleEnter = () => {
    setList(hoverRow.current);
  };

  const handleSlide = (event: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    event.preventDefault();
    setIndex(1);
  };

  return (
    <Box height={1} ref={slideContainer} sx={{ willChange: 'transform' }}>
      <Slide
        appear={false}
        container={slideContainer.current}
        direction="right"
        easing="ease-in"
        in={index === 0}
        timeout={300}
      >
        <Box
          display="flex"
          flexDirection="column"
          height={1}
        >
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
                <ListItem
                  sx={isActive ? activeStyle : listStyle}
                  onMouseEnter={() => {
                    hoverRow.current = 'artists';
                  }}
                >
                  <Box sx={activeBox(isActive)} />
                  <SvgIcon sx={{ mx: '8px' }}><IoMdMicrophone /></SvgIcon>
                  Artists
                  <SvgIcon
                    className="listsvg"
                    sx={svgStyle}
                    onClick={(event) => handleSlide(event)}
                  >
                    <BiChevronRight />
                  </SvgIcon>
                </ListItem>
              )}
            </NavLink>
            <NavLink className="nav-link" to="/albums">
              {({ isActive }) => (
                <ListItem
                  sx={isActive ? activeStyle : listStyle}
                  onMouseEnter={() => {
                    hoverRow.current = 'albums';
                  }}
                >
                  <Box sx={activeBox(isActive)} />
                  <SvgIcon sx={{ mx: '8px' }}><RiAlbumFill /></SvgIcon>
                  Albums
                  <SvgIcon
                    className="listsvg"
                    sx={svgStyle}
                    onClick={(event) => handleSlide(event)}
                  >
                    <BiChevronRight />
                  </SvgIcon>
                </ListItem>
              )}
            </NavLink>
            <NavLink className="nav-link" to="/tracks">
              {({ isActive }) => (
                <ListItem
                  sx={isActive ? activeStyle : listStyle}
                  onMouseEnter={() => {
                    hoverRow.current = 'tracks';
                  }}
                >
                  <Box sx={activeBox(isActive)} />
                  <SvgIcon sx={{ mx: '8px' }}><BsMusicNote /></SvgIcon>
                  Tracks
                  <SvgIcon
                    className="listsvg"
                    sx={svgStyle}
                    onClick={(event) => handleSlide(event)}
                  >
                    <BiChevronRight />
                  </SvgIcon>
                </ListItem>
              )}
            </NavLink>
            <NavLink className="nav-link" to="/genres">
              {({ isActive }) => (
                <ListItem
                  sx={isActive ? activeStyle : listStyle}
                  onMouseEnter={() => {
                    hoverRow.current = 'genres';
                  }}
                >
                  <Box sx={activeBox(isActive)} />
                  <SvgIcon sx={{ mx: '8px' }}><FaTags /></SvgIcon>
                  Genres
                  <SvgIcon
                    className="listsvg"
                    sx={svgStyle}
                    onClick={(event) => handleSlide(event)}
                  >
                    <BiChevronRight />
                  </SvgIcon>
                </ListItem>
              )}
            </NavLink>
          </List>
          <ClickAwayListener onClickAway={() => setShow(false)}>
            <Box>
              <PlaylistSubheader setShow={setShow} show={show} />
            </Box>
          </ClickAwayListener>
          <PlaylistLinks />
        </Box>
      </Slide>
      <Slide
        container={slideContainer.current}
        direction="left"
        easing="ease-in"
        in={index === 1}
        timeout={300}
        onEnter={handleEnter}
      >
        <Box
          height={1}
          left={0}
          marginX="8px"
          position="absolute"
          top={0}
          width="calc(100% - 16px)"
        >
          <Navlist list={list} setIndex={setIndex} />
        </Box>
      </Slide>
    </Box>
  );
};

export default Navbar;
