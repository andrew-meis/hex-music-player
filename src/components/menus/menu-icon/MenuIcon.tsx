import { Box, BoxProps, SvgIcon } from '@mui/material';
import { MenuState } from '@szhsin/react-menu';
import React from 'react';
import { FiMoreVertical } from 'react-icons/fi';

interface MenuIconProps extends BoxProps {
  menuRef: React.MutableRefObject<HTMLDivElement | null>;
  menuState: MenuState | undefined;
  toggleMenu: (open?: boolean | undefined) => void;
}

const MenuIcon = ({ menuRef, menuState, toggleMenu, ...rest }: MenuIconProps) => (
  <Box
    alignItems="center"
    color={menuState === 'open' || menuState === 'opening'
      ? 'text.primary'
      : 'text.secondary'}
    display="flex"
    justifyContent="center"
    ref={menuRef}
    sx={{
      cursor: 'pointer',
      '&:hover': {
        color: 'text.primary',
      },
    }}
    onClick={() => {
      if (!menuState) {
        toggleMenu(true);
        return;
      }
      if (menuState !== 'closed') {
        toggleMenu(false);
        return;
      }
      toggleMenu(true);
    }}
    {...rest}
  >
    <SvgIcon>
      <FiMoreVertical />
    </SvgIcon>
  </Box>
);

export default MenuIcon;
