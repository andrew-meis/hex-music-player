import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useRef } from 'react';
import { Playlist } from 'api/index';
import { ChipFilter } from 'components/chips';
import { MenuIcon, PlaylistMenu } from 'components/menus';
import { WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';

const Subheader: React.FC<{
  filter: string,
  setFilter: React.Dispatch<React.SetStateAction<string>>,
  playlist: Playlist,
}> = ({
  filter,
  setFilter,
  playlist,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuProps, toggleMenu] = useMenuState({ transition: true, unmountOnClose: true });
  const { playSwitch } = usePlayback();

  return (
    <Box
      alignItems="center"
      display="flex"
      height={72}
      justifyContent="space-between"
      mt={1}
      mx="auto"
      width={WIDTH_CALC}
    >
      <ChipFilter
        filter={filter}
        setFilter={setFilter}
      />
      <MenuIcon
        height={32}
        menuRef={menuRef}
        menuState={menuProps.state}
        toggleMenu={toggleMenu}
        width={24}
      />
      <PlaylistMenu
        arrow
        portal
        align="center"
        anchorRef={menuRef}
        direction="left"
        playSwitch={playSwitch}
        playlists={[playlist]}
        toggleMenu={toggleMenu}
        {...menuProps}
      />
    </Box>
  );
};

export default Subheader;
