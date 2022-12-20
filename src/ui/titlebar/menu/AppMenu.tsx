import { Avatar, Box, Dialog, SvgIcon, Typography, useTheme } from '@mui/material';
import { grey } from '@mui/material/colors';
import { MenuItem } from '@szhsin/react-menu';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { XMLParser } from 'fast-xml-parser';
import React, { useState } from 'react';
import {
  FiLogOut, IoInformationCircleOutline, IoSettingsSharp,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import ActionMenu from 'components/action-menu/ActionMenu';
import useQueue from 'hooks/useQueue';
import { useConfig, useLibrary } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useNowPlaying, useUser } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import { isPlayQueueItem } from 'types/type-guards';
import type { IConfig } from 'types/interfaces';

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

const AppMenu = () => {
  const library = useLibrary();
  const navigate = useNavigate();
  const player = usePlayerContext();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const { data: config } = useConfig();
  const { data: nowPlaying } = useNowPlaying();
  const { data: playerState } = usePlayerState();
  const { data: user } = useUser();
  const { data: users } = useQuery<User[]>(
    ['users'],
    async () => {
      const url = `https://plex.tv/api/home/users?X-Plex-Token=${config.token}`;
      const response = await axios.get(url);
      const json = await parse(response.data);
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
      await updateTimeline(nowPlaying.id, 'stopped', playerState.position, nowPlaying.track);
    }
    player.resetApp();
    const newConfig = window.electron.readConfig('config') as IConfig;
    newConfig.token = token;
    window.electron.writeConfig('config', newConfig);
    navigate('/');
  };

  const handleSwitchUser = async (uuid: string) => {
    // eslint-disable-next-line max-len
    const url = `https://plex.tv/api/v2/home/users/${uuid}/switch?X-Plex-Client-Identifier=${config.clientId}&X-Plex-Token=${config.token}`;
    const response = await axios.post(url, { headers: library.api.headers() });
    setOpen(false);
    await handleLogout(response.data.authToken);
  };

  return (
    <>
      <ActionMenu
        align={platform === 'darwin' ? 'end' : 'start'}
        offsetX={platform === 'darwin' ? -6 : 6}
        style={{
          fontSize: '1rem',
          minWidth: '198px',
          '--menu-grey': theme.palette.mode === 'light' ? grey['100'] : grey['800'],
        } as React.CSSProperties}
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
      </ActionMenu>
      <Dialog
        maxWidth="xs"
        open={open}
        sx={{
          zIndex: 2000,
        }}
        onClose={() => setOpen(false)}
      >
        <Box height="fit-content">
          <Typography fontFamily="TT Commons" margin="12px" variant="h6">
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
