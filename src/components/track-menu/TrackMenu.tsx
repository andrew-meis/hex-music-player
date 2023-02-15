import { SvgIcon } from '@mui/material';
import { ControlledMenu, ControlledMenuProps, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { Track } from 'hex-plex';
import React, { useCallback } from 'react';
import { MdPlaylistAdd, RiAlbumFill, TbWaveSawTool, TiInfoLarge } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';

interface TrackMenuProps extends ControlledMenuProps{
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  toggleMenu: (open?: boolean | undefined) => void;
  tracks: Track[] | undefined;
}

const TrackMenu = ({
  children,
  playSwitch,
  toggleMenu,
  tracks,
  ...props
}: TrackMenuProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!tracks) {
      return;
    }
    if (tracks.length === 1) {
      const [track] = tracks;
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (tracks.length > 1) {
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
    }
  }, [playSwitch, tracks]);

  if (!tracks) return null;

  return (
    <ControlledMenu
      portal
      onClose={() => toggleMenu(false)}
      {...props}
    >
      {tracks.length === 1 && trackButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      {tracks.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem
        onClick={() => queryClient
          .setQueryData(['playlist-dialog-open'], tracks)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
        Add to playlist
      </MenuItem>
      {tracks.length === 1 && (
        <>
          <MenuItem
            onClick={() => navigate(`/tracks/${tracks[0].id}/similar`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
            Similar tracks
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => navigate(`/tracks/${tracks[0].id}`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
            Track information
          </MenuItem>
          <MenuItem onClick={() => navigate(`/albums/${tracks[0].parentId}`)}>
            <SvgIcon sx={{ mr: '8px' }}><RiAlbumFill /></SvgIcon>
            Go to album
          </MenuItem>
        </>
      )}
      {children}
    </ControlledMenu>
  );
};

export default React.memo(TrackMenu);
