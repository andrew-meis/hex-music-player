import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Album } from 'api/index';
import { ChipGenres } from 'components/chips';
import { MenuIcon, AlbumMenu } from 'components/menus';
import { TableSettings } from 'components/track/column-headers';
import { WIDTH_CALC } from 'constants/measures';
import { PaletteState } from 'hooks/usePalette';
import usePlayback from 'hooks/usePlayback';

const Subheader: React.FC<{
  album: Album,
  colors: PaletteState,
  openColumnDialog: () => void,
}> = ({
  album,
  colors,
  openColumnDialog,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
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
      <ChipGenres
        colors={Object.values(colors!)}
        genres={album.genre}
        navigate={navigate}
      />
      <Box display="flex">
        <TableSettings
          openColumnDialog={openColumnDialog}
        />
        <MenuIcon
          height={32}
          menuRef={menuRef}
          menuState={menuProps.state}
          toggleMenu={toggleMenu}
          width={24}
        />
      </Box>
      <AlbumMenu
        arrow
        portal
        albumLink={false}
        albums={[album]}
        align="center"
        anchorRef={menuRef}
        direction="left"
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        {...menuProps}
      />
    </Box>
  );
};

export default Subheader;
