import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuHeader,
  MenuItem,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { MdPlaylistAdd } from 'react-icons/md';
import { RiHistoryFill } from 'react-icons/ri';
import { TbWaveSawTool } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { Album } from 'api/index';
import { ButtonSpecs, albumButtons } from 'constants/buttons';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';
import AlbumMenuItem from './menu-items/AlbumMenuItem';
import ArtistMenuItem from './menu-items/ArtistMenuItem';

interface AlbumMenuProps extends ControlledMenuProps{
  albumLink?: boolean;
  albums: Album[] | undefined;
  artistLink?: boolean;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  toggleMenu: (open?: boolean | undefined) => void;
}

const AlbumMenu = ({
  albumLink,
  albums,
  artistLink,
  children,
  playSwitch,
  toggleMenu,
  ...props
}: AlbumMenuProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleArtistNavigate = (album: Album) => {
    const state = { guid: album.parentGuid, title: album.parentTitle };
    navigate(`/artists/${album.parentId}`, { state });
  };

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!albums) {
      return;
    }
    if (albums.length === 1) {
      const [album] = albums;
      await playSwitch(button.action, { album, shuffle: button.shuffle });
    }
  }, [playSwitch, albums]);

  if (!albums) return null;

  return (
    <ControlledMenu
      portal
      boundingBoxPadding="10"
      onClose={() => toggleMenu(false)}
      {...props}
    >
      {albums.length === 1 && albumButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem
        onClick={() => queryClient
          .setQueryData(['playlist-dialog-open'], albums)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
        Add to playlist
      </MenuItem>
      {albums.length === 1 && (
        <>
          <MenuItem onClick={() => {}}>
            <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
            Similar albums
          </MenuItem>
          <MenuItem onClick={() => navigate(`/history/${albums[0].id}`)}>
            <SvgIcon sx={{ mr: '8px' }}><RiHistoryFill /></SvgIcon>
            View play history
          </MenuItem>
          {artistLink && (
            <>
              <MenuDivider />
              <MenuHeader>Artists</MenuHeader>
              <ArtistMenuItem
                thumb={albums[0].parentThumb}
                title={albums[0].parentTitle}
                onClick={() => handleArtistNavigate(albums[0])}
              />
            </>
          )}
          {albumLink && (
            <>
              <MenuDivider />
              <MenuHeader>Album</MenuHeader>
              <AlbumMenuItem
                thumb={albums[0].thumb}
                title={albums[0].title}
                onClick={() => navigate(`/albums/${albums[0].id}`)}
              />
            </>
          )}
        </>
      )}
      {children}
    </ControlledMenu>
  );
};

AlbumMenu.defaultProps = {
  albumLink: true,
  artistLink: true,
};

export default AlbumMenu;
