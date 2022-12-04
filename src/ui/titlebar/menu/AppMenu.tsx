import { Avatar, Box, SvgIcon, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import {
  Menu, MenuItem, MenuButton, MenuButtonProps,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import {
  FiLogOut, FiMoreVertical, IoInformationCircleOutline, IoSettingsSharp,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import useMenuStyle from 'hooks/useMenuStyle';
import useQueue from 'hooks/useQueue';
import { appQueryKeys, useLibrary } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useNowPlaying, useUser } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import styles from 'styles/Titlebar.module.scss';
import { isPlayQueueItem } from 'types/type-guards';
import type { IConfig } from 'types/interfaces';

const { platform } = window.electron.getAppInfo();

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

const AppMenu = () => {
  const library = useLibrary();
  const menuStyle = useMenuStyle();
  const navigate = useNavigate();
  const player = usePlayerContext();
  const queryClient = useQueryClient();
  const theme = useTheme();
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
    const config = window.electron.readConfig('config') as IConfig;
    config.token = '';
    window.electron.writeConfig('config', config);
    queryClient.removeQueries(appQueryKeys.config);
    queryClient.removeQueries(appQueryKeys.auth);
  };

  return (
    <Menu
      transition
      align={platform === 'darwin' ? 'end' : 'start'}
      menuButton={({ open }) => <AppMenuButton open={open} />}
      menuStyle={{
        ...menuStyle,
        fontSize: '1rem',
        minWidth: '198px',
        '--menu-grey': theme.palette.mode === 'light' ? grey['100'] : grey['800'],
      } as React.CSSProperties}
      offsetX={platform === 'darwin' ? -6 : 6}
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
