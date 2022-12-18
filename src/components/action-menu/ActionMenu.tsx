import { Box, SvgIcon } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuProps } from '@szhsin/react-menu';
import React from 'react';
import { FiMoreVertical } from 'react-icons/all';
import useMenuStyle from 'hooks/useMenuStyle';
import styles from 'styles/Common.module.scss';

interface ActionMenuButtonProps extends MenuButtonProps{
  open: boolean;
}

const ActionMenuButton = React.forwardRef((
  { open, onClick, onKeyDown }: ActionMenuButtonProps,
  ref,
) => (
  <MenuButton
    className={styles['action-menu-button']}
    ref={ref}
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
      width={32}
    >
      <SvgIcon>
        <FiMoreVertical />
      </SvgIcon>
    </Box>
  </MenuButton>
));

interface ActionMenuProps extends MenuProps {
  // eslint-disable-next-line react/require-default-props
  style?: React.CSSProperties;
}

const ActionMenu = ({ children, style, ...props }: Omit<ActionMenuProps, 'menuButton'>) => {
  const menuStyle = useMenuStyle();
  return (
    <Menu
      transition
      menuButton={({ open }) => <ActionMenuButton open={open} />}
      menuStyle={{ ...menuStyle, ...style }}
      {...props}
    >
      {children}
    </Menu>
  );
};

export default ActionMenu;
