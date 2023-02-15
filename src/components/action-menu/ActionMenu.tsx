import { Box, SvgIcon } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuProps } from '@szhsin/react-menu';
import React from 'react';
import { FiMoreVertical } from 'react-icons/all';

interface ActionMenuButtonProps extends MenuButtonProps{
  open: boolean;
  width: number;
}

export const ActionMenuButton = React.forwardRef((
  { open, width, onClick, onKeyDown }: ActionMenuButtonProps,
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

interface ActionMenuProps extends MenuProps {
  style?: React.CSSProperties;
  width: number;
}

const ActionMenu = ({
  children, style = {}, width, ...props
}: Omit<ActionMenuProps, 'menuButton'>) => (
  <Menu
    transition
    menuButton={({ open }) => <ActionMenuButton open={open} width={width} />}
    menuStyle={style}
    {...props}
  >
    {children}
  </Menu>
);

export default ActionMenu;
