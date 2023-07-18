import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuItem,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { MdPlaylistAdd } from 'react-icons/md';
import { RiHistoryFill } from 'react-icons/ri';
import { TbWaveSawTool } from 'react-icons/tb';
import { useNavigate } from 'react-router-dom';
import { Artist } from 'api/index';
import { ButtonSpecs, artistButtons } from 'constants/buttons';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';
import ArtistMenuItem from './menu-items/ArtistMenuItem';

interface ArtistMenuProps extends ControlledMenuProps{
  artists: Artist[] | undefined;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  toggleMenu: (open?: boolean | undefined) => void;
}

const ArtistMenu = ({
  artists,
  children,
  playSwitch,
  toggleMenu,
  ...props
}: ArtistMenuProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleArtistNavigate = (artist: Artist) => {
    const state = { guid: artist.guid, title: artist.title };
    navigate(`/artists/${artist.id}`, { state });
  };

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!artists) {
      return;
    }
    if (artists.length === 1) {
      const [artist] = artists;
      await playSwitch(button.action, { artist, shuffle: button.shuffle });
    }
  }, [playSwitch, artists]);

  if (!artists) return null;

  return (
    <ControlledMenu
      portal
      boundingBoxPadding="10"
      onClose={() => toggleMenu(false)}
      {...props}
    >
      {artists.length === 1 && artistButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem
        onClick={() => queryClient
          .setQueryData(['playlist-dialog-open'], artists)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
        Add to playlist
      </MenuItem>
      {artists.length === 1 && (
        <>
          <MenuItem onClick={() => navigate(`/artists/${artists[0].id}/similar`)}>
            <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
            Similar artists
          </MenuItem>
          <MenuItem onClick={() => navigate(`/history/${artists[0].id}`)}>
            <SvgIcon sx={{ mr: '8px' }}><RiHistoryFill /></SvgIcon>
            View play history
          </MenuItem>
          <MenuDivider />
          <ArtistMenuItem
            thumb={artists[0].thumb}
            title={artists[0].title}
            onClick={() => handleArtistNavigate(artists[0])}
          />
        </>
      )}
      {children}
    </ControlledMenu>
  );
};

export default ArtistMenu;
