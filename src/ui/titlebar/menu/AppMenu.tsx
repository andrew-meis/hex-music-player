import { Avatar, Box, Dialog, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import { useQuery } from '@tanstack/react-query';
import { XMLParser } from 'fast-xml-parser';
import ky from 'ky';
import React, { useState } from 'react';
import {
  FiLogOut,
  FiMoreVertical,
  IoInformationCircleOutline,
  IoSettingsSharp,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import useQueue from 'hooks/useQueue';
import { useConfig, useLibrary } from 'queries/app-queries';
import { useNowPlaying, useUser } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { AppConfig } from 'types/interfaces';
import { isPlayQueueItem } from 'types/type-guards';

interface User {
  admin: string;
  email: string;
  guest: string;
  hasPassword: string;
  id: string;
  protected: string;
  restricted: string;
  restrictionProfile: string;
  thumb: string;
  title: string;
  username: string;
  uuid: string;
}

const options = {
  ignoreAttributes: false,
  attributeNamePrefix: '',
};

const parser = new XMLParser(options);
const parse = async (text: string) => parser.parse(text);

const { platform } = window.electron.getAppInfo();

interface IconMenuButtonProps extends MenuButtonProps{
  open: boolean;
  width: number;
}

const IconMenuButton = React.forwardRef((
  { open, width, onClick, onKeyDown }: IconMenuButtonProps,
  ref,
) => (
  <MenuButton
    ref={ref}
    style={{
      backgroundColor: 'transparent',
      border: 'none',
      padding: 0,
      WebkitAppRegion: 'no-drag',
    } as React.CSSProperties}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <Box
      alignItems="center"
      color={open ? 'text.primary' : 'text.secondary'}
      display="flex"
      height={32}
      justifyContent="center"
      sx={{
        cursor: 'pointer',
        '&:hover': {
          color: 'text.primary',
        },
      }}
      width={width}
    >
      <SvgIcon>
        <FiMoreVertical />
      </SvgIcon>
    </Box>
  </MenuButton>
));

const AppMenu = () => {
  const library = useLibrary();
  const navigate = useNavigate();
  const player = usePlayerContext();
  const [open, setOpen] = useState(false);
  const { data: config } = useConfig();
  const { data: nowPlaying } = useNowPlaying();
  const { data: user } = useUser();
  const { data: users } = useQuery<User[]>(
    ['users'],
    async () => {
      const url = `https://plex.tv/api/home/users?X-Plex-Token=${config.token}`;
      const response = await ky(url).text();
      const json = await parse(response);
      return json.MediaContainer.User;
    },
    {
      enabled: !!library,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
    },
  );
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

  const handleLogout = async (token: string) => {
    if (nowPlaying && isPlayQueueItem(nowPlaying)) {
      player.clearTimer();
      await updateTimeline(nowPlaying.id, 'stopped', player.getPosition(), nowPlaying.track);
    }
    player.resetApp();
    const newConfig = window.electron.readConfig('config') as AppConfig;
    newConfig.token = token;
    window.electron.writeConfig('config', newConfig);
    navigate('/login');
  };

  const handleSwitchUser = async (uuid: string) => {
    // eslint-disable-next-line max-len
    const url = `https://plex.tv/api/v2/home/users/${uuid}/switch?X-Plex-Client-Identifier=${config.clientId}&X-Plex-Token=${config.token}`;
    const response = await ky.post(url, { headers: library.api.headers() })
      .json() as Record<string, any>;
    setOpen(false);
    await handleLogout(response.authToken);
  };

  return (
    <>
      <Menu
        portal
        transition
        unmountOnClose
        align={platform === 'darwin' ? 'end' : 'start'}
        menuButton={({ open: menuOpen }) => <IconMenuButton open={menuOpen} width={32} />}
        menuStyle={{
          fontSize: '1rem',
          minWidth: '198px',
        }}
        offsetX={platform === 'darwin' ? -6 : 6}
      >
        <MenuItem
          style={{
            marginBottom: 5,
            padding: 0,
          }}
          onClick={() => setOpen(true)}
        >
          <Box
            alignItems="center"
            bgcolor="action.selected"
            borderRadius="4px"
            display="flex"
            fontSize="14px"
            fontWeight={600}
            py="7px"
            sx={{
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'action.disabled',
              },
            }}
            width={1}
          >
            <Avatar
              alt={user?.title}
              src={thumbSrc}
              sx={{
                height: '36px',
                width: '36px',
                marginLeft: '8px',
                marginRight: '8px',
              }}
            />
            {user?.title}
          </Box>
        </MenuItem>
        <MenuItem onClick={handleAbout}>
          <SvgIcon sx={{ mr: '8px' }}><IoInformationCircleOutline /></SvgIcon>
          About
        </MenuItem>
        <MenuItem onClick={handleSettings}>
          <SvgIcon sx={{ mr: '8px' }}><IoSettingsSharp /></SvgIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={() => handleLogout('')}>
          <SvgIcon sx={{ mr: '8px' }}><FiLogOut /></SvgIcon>
          Logout
        </MenuItem>
      </Menu>
      <Dialog
        maxWidth="xs"
        open={open}
        sx={{
          zIndex: 2000,
        }}
        onClose={() => setOpen(false)}
      >
        <Box height="fit-content">
          <Typography fontFamily="TT Commons, sans-serif" margin="12px" variant="h6">
            Select user:
          </Typography>
          {users?.map((obj) => (
            <Box
              alignItems="center"
              bgcolor="action.selected"
              borderRadius="4px"
              display="flex"
              key={obj.uuid}
              margin="8px"
              padding="8px"
              sx={{
                cursor: 'pointer',
                '&:hover': {
                  bgcolor: 'action.disabled',
                },
              }}
              width={280}
              onClick={() => handleSwitchUser(obj.uuid)}
            >
              <Avatar
                alt={obj.title}
                src={obj.thumb}
                sx={{ height: 56, marginRight: 'auto', width: 56 }}
              />
              <Typography marginRight="auto">
                {obj.title}
              </Typography>
            </Box>
          ))}
        </Box>
      </Dialog>
    </>
  );
};

export default AppMenu;
