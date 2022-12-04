import {
  Box, Collapse, List, ListItem, SvgIcon, Typography, useTheme,
} from '@mui/material';
import { grey } from '@mui/material/colors';
import {
  ControlledMenu, MenuDivider, MenuItem, useMenuState,
} from '@szhsin/react-menu';
import React, { useState } from 'react';
import {
  FaCaretDown, FaCaretRight, MdDelete, TiFolder,
} from 'react-icons/all';
import { useDeletePlaylist } from 'hooks/playlistHooks';
import useMenuStyle from 'hooks/useMenuStyle';
import usePlayback from 'hooks/usePlayback';
import useToast from 'hooks/useToast';
import { usePlaylists } from 'queries/playlist-queries';
import { ButtonSpecs, playlistButtons } from '../../../../constants/buttons';
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
  const deletePlaylist = useDeletePlaylist();
  const menuStyle = useMenuStyle();
  const toast = useToast();
  const theme = useTheme();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const [menuTarget, setMenuTarget] = useState<number>();
  const [open, setOpen] = useState(false);
  const { data: playlists } = usePlaylists();
  const { playPlaylist } = usePlayback();

  const handleContextMenu = (event: React.MouseEvent) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    setMenuTarget(parseInt(target, 10));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  };

  const handleMenuSelection = async (button: ButtonSpecs) => {
    if (!menuTarget || !playlists) {
      return;
    }
    const playlistTarget = playlists.find((playlist) => playlist.id === menuTarget);
    if (!playlistTarget) {
      return;
    }
    if (playlistTarget.leafCount === 0) {
      toast({ type: 'info', text: 'No tracks in playlist' });
      return;
    }
    await playPlaylist(playlistTarget, button.shuffle);
  };

  const handleOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <List disablePadding className="scroll-container" sx={{ overflow: 'overlay', mr: '4px' }}>
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
      <ControlledMenu
        {...menuProps}
        portal
        anchorPoint={anchorPoint}
        menuStyle={{
          ...menuStyle,
          '--menu-grey': theme.palette.mode === 'light' ? grey['100'] : grey['800'],
        } as React.CSSProperties}
        onClose={() => toggleMenu(false)}
      >
        {playlistButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem
          style={{
            '--menu-primary': theme.palette.error.main,
            '--menu-transparent': `${theme.palette.error.main}cc`,
          } as React.CSSProperties}
          onClick={() => deletePlaylist(menuTarget as number)}
        >
          <SvgIcon sx={{ mr: '8px' }}><MdDelete /></SvgIcon>
          Delete
        </MenuItem>
      </ControlledMenu>
    </>
  );
};

export default PlaylistLinks;
