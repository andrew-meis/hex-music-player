import { SvgIcon } from '@mui/material';
import { ControlledMenu, MenuDivider, MenuItem, MenuState } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { Track } from 'hex-plex';
import React from 'react';
import { MdPlaylistAdd, TbWaveSawTool, TiInfoLarge } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';

interface TrackMenuProps{
  anchorPoint: { x: number; y: number; };
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  handleMenuSelection: (button: ButtonSpecs) => Promise<void>;
  menuProps: {
      state?: MenuState | undefined;
      endTransition: () => void;
  };
  selectedRows: number[];
  toggleMenu: (open?: boolean | undefined) => void;
  track: Track | undefined;
}

const TrackMenu = ({
  anchorPoint,
  children,
  handleMenuSelection,
  menuProps,
  selectedRows,
  toggleMenu,
  track,
}: TrackMenuProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  if (!track) return null;
  return (
    <ControlledMenu
      {...menuProps}
      portal
      anchorPoint={anchorPoint}
      onClose={() => toggleMenu(false)}
    >
      {selectedRows.length === 1 && trackButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      {selectedRows.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      {selectedRows.length === 1 && (
        <>
          <MenuItem
            onClick={() => queryClient
              .setQueryData(['playlist-dialog-open'], track)}
          >
            <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
            Add to playlist
          </MenuItem>
          <MenuDivider />
          <MenuItem
            onClick={() => navigate(`/tracks/${track.id}`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
            Track information
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/tracks/${track.id}/similar`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
            Similar tracks
          </MenuItem>
        </>
      )}
      {children}
    </ControlledMenu>
  );
};

export default TrackMenu;
