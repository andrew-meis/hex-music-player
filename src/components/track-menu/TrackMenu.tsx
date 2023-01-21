import { SvgIcon } from '@mui/material';
import { ControlledMenu, MenuDivider, MenuItem, MenuState } from '@szhsin/react-menu';
import React from 'react';
import { TbWaveSawTool, TiInfoLarge } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';

interface TrackMenuProps{
  anchorPoint: { x: number; y: number; };
  // eslint-disable-next-line react/require-default-props
  children?: React.ReactNode;
  handleMenuSelection: (button: ButtonSpecs) => Promise<void>;
  id: number;
  menuProps: {
      state?: MenuState | undefined;
      endTransition: () => void;
  };
  menuStyle: React.CSSProperties;
  selectedRows: number[];
  toggleMenu: (open?: boolean | undefined) => void;
}

const TrackMenu = ({
  anchorPoint,
  children,
  handleMenuSelection,
  id,
  menuProps,
  menuStyle,
  selectedRows,
  toggleMenu,
}: TrackMenuProps) => {
  const navigate = useNavigate();
  return (
    <ControlledMenu
      {...menuProps}
      portal
      anchorPoint={anchorPoint}
      menuStyle={menuStyle}
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
          <MenuDivider />
          <MenuItem
            onClick={() => {
              if (id !== 0) navigate(`/tracks/${id}`);
            }}
          >
            <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
            Track information
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (id !== 0) navigate(`/tracks/${id}/similar`);
            }}
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
