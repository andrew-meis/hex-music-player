import { Avatar, Box, SvgIcon } from '@mui/material';
import {
  Menu, MenuItem, MenuButton, MenuButtonProps,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  FiLogOut, FiMoreVertical, IoInformationCircleOutline, IoSettingsSharp,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import styles from 'styles/Titlebar.module.scss';
import { usePlayerContext } from '../../../core/Player';
import { useLibrary, useNowPlaying, usePlayerState, useUser } from '../../../hooks/queryHooks';
import useQueue from '../../../hooks/useQueue';
import { Config } from '../../../types/interfaces';
import { isPlayQueueItem } from '../../../types/type-guards';

interface AppMenuButtonProps extends MenuButtonProps{
  open: boolean;
}

const AppMenuButton = React.forwardRef((
  { open, onClick, onKeyDown }: AppMenuButtonProps,
  ref,
) => (
  <MenuButton
    className={styles['menu-button']}
    ref={ref}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <SvgIcon sx={{ color: open ? 'action.selected' : 'text.primary' }}><FiMoreVertical /></SvgIcon>
  </MenuButton>
));

interface AppMenuProps {
  setAuthenticated: React.Dispatch<React.SetStateAction<string>>;
}

const AppMenu = ({ setAuthenticated }: AppMenuProps) => {
  const library = useLibrary();
  const navigate = useNavigate();
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const { data: nowPlaying } = useNowPlaying();
  const { data: playerState } = usePlayerState();
  const { data: user } = useUser();
  const { updateTimeline } = useQueue();
  const thumbSrc = user?.thumb
    ? library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: user?.thumb, width: 50, height: 50, minSize: 1, upscale: 1,
      },
    )
    : undefined;

  const handleAbout = () => {
    console.log(player);
  };

  const handleSettings = () => {
    navigate('/settings');
  };

  const handleLogout = async () => {
    if (nowPlaying && isPlayQueueItem(nowPlaying)) {
      player.clearTimer();
      await updateTimeline(nowPlaying.id, 'stopped', playerState.position, nowPlaying.track);
    }
    await player.resetApp();
    const config = window.electron.readConfig('config') as Config;
    config.token = '';
    window.electron.writeConfig('config', config);
    queryClient.removeQueries(['config']);
    queryClient.removeQueries(['app']);
    setAuthenticated('unknown');
  };

  return (
    <Menu
      transition
      menuButton={({ open }) => <AppMenuButton open={open} />}
      menuStyle={{ minWidth: '198px' }}
      offsetX={6}
    >
      <Box
        alignItems="center"
        bgcolor="action.selected"
        borderRadius="4px"
        display="flex"
        fontSize="14px"
        fontWeight={600}
        mb="5px"
        mx="5px"
        py="7px"
      >
        <Avatar
          alt={user?.username}
          src={thumbSrc}
          sx={{
            height: '36px',
            width: '36px',
            marginLeft: '8px',
            marginRight: '8px',
          }}
        />
        {user?.username}
      </Box>
      <MenuItem onClick={handleAbout}>
        <SvgIcon sx={{ mr: '8px' }}><IoInformationCircleOutline /></SvgIcon>
        About
      </MenuItem>
      <MenuItem onClick={handleSettings}>
        <SvgIcon sx={{ mr: '8px' }}><IoSettingsSharp /></SvgIcon>
        Settings
      </MenuItem>
      <MenuItem onClick={handleLogout}>
        <SvgIcon sx={{ mr: '8px' }}><FiLogOut /></SvgIcon>
        Logout
      </MenuItem>
    </Menu>
  );
};

export default AppMenu;
