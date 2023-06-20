import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuItem,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import {
  IoMdMicrophone,
  MdPlaylistAdd,
  RiAlbumFill,
  TbWaveSawTool,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { Album } from 'api/index';
import { ButtonSpecs, albumButtons } from 'constants/buttons';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';

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
          <MenuDivider />
          {artistLink && (
            <MenuItem onClick={() => handleArtistNavigate(albums[0])}>
              <SvgIcon sx={{ mr: '8px' }}><IoMdMicrophone /></SvgIcon>
              Go to artist
            </MenuItem>
          )}
          {albumLink && (
            <MenuItem onClick={() => navigate(`/albums/${albums[0].id}`)}>
              <SvgIcon sx={{ mr: '8px' }}><RiAlbumFill /></SvgIcon>
              Go to album
            </MenuItem>
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
