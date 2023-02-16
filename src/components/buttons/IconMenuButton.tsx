import { Box, SvgIcon } from '@mui/material';
import { MenuButton, MenuButtonProps } from '@szhsin/react-menu';
import React from 'react';
import { FiMoreVertical } from 'react-icons/all';

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

export default IconMenuButton;
