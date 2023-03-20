import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuItem,
  SubMenu,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { Artist, Track } from 'hex-plex';
import React, { useCallback } from 'react';
import {
  IoMdMicrophone,
  MdPlaylistAdd,
  RiAlbumFill,
  TbWaveSawTool,
  TiInfoLarge,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { ButtonSpecs, trackButtons, tracksButtons } from 'constants/buttons';
import useArtistMatch from 'hooks/useArtistMatch';
import { PlayParams } from 'hooks/usePlayback';
import { PlayActions } from 'types/enums';

interface NowPlayingMenuProps extends ControlledMenuProps{
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  toggleMenu: (open?: boolean | undefined) => void;
  tracks: Track[] | undefined;
}

const NowPlayingMenu = ({
  children,
  playSwitch,
  toggleMenu,
  tracks,
  ...props
}: NowPlayingMenuProps) => {
  const artists = useArtistMatch({
    name: tracks && tracks.length === 1
      ? tracks[0].originalTitle || tracks[0].grandparentTitle
      : '',
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const handleArtistNavigate = (artist: Artist) => {
    const state = { guid: artist.guid, title: artist.title };
    navigate(`/artists/${artist.id}`, { state });
  };

  const handleTrackNavigate = (track: Track) => {
    const state = { guid: track.grandparentId, title: track.grandparentTitle };
    navigate(`/artists/${track.grandparentId}`, { state });
  };

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!tracks) {
      return;
    }
    if (tracks.length === 1) {
      const [track] = tracks;
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (tracks.length > 1) {
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
    }
  }, [playSwitch, tracks]);

  if (!tracks) return null;

  return (
    <ControlledMenu
      portal
      onClose={() => toggleMenu(false)}
      {...props}
      boundingBoxPadding="10"
    >
      {tracks.length === 1 && trackButtons.slice(1).map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      {tracks.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
        <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem
        onClick={() => queryClient
          .setQueryData(['playlist-dialog-open'], tracks)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
        Add to playlist
      </MenuItem>
      {tracks.length === 1 && (
        <>
          <MenuItem
            onClick={() => navigate(`/tracks/${tracks[0].id}/similar`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
            Similar tracks
          </MenuItem>
          <MenuDivider />
          {
            tracks[0].grandparentTitle === 'Various Artists'
            && artists.length === 1
            && (
              <SubMenu
                align="center"
                direction="right"
                label={(
                  <>
                    <SvgIcon sx={{ mr: '8px' }}><IoMdMicrophone /></SvgIcon>
                    Go to artist
                  </>
                )}
              >
                {artists.map((artist) => (
                  <MenuItem key={artist.id} onClick={() => handleArtistNavigate(artist)}>
                    {artist.title}
                  </MenuItem>
                ))}
              </SubMenu>
            )
          }
          {
            (artists.length === 0 || artists.length === 1)
            && tracks[0].grandparentTitle !== 'Various Artists'
            && (
              <SubMenu
                align="center"
                direction="right"
                label={(
                  <>
                    <SvgIcon sx={{ mr: '8px' }}><IoMdMicrophone /></SvgIcon>
                    Go to artist
                  </>
                )}
              >
                <MenuItem onClick={() => handleTrackNavigate(tracks[0])}>
                  {tracks[0].grandparentTitle}
                </MenuItem>
              </SubMenu>
            )
          }
          {
            artists.length > 1
            && (
              <SubMenu
                align="center"
                direction="right"
                label={(
                  <>
                    <SvgIcon sx={{ mr: '8px' }}><IoMdMicrophone /></SvgIcon>
                    Go to artist
                  </>
                )}
              >
                {artists.map((artist) => (
                  <MenuItem key={artist.id} onClick={() => handleArtistNavigate(artist)}>
                    {artist.title}
                  </MenuItem>
                ))}
              </SubMenu>
            )
          }
          <MenuItem onClick={() => navigate(`/albums/${tracks[0].parentId}`)}>
            <SvgIcon sx={{ mr: '8px' }}><RiAlbumFill /></SvgIcon>
            Go to album
          </MenuItem>
          <MenuItem
            onClick={() => navigate(`/tracks/${tracks[0].id}`)}
          >
            <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
            Track information
          </MenuItem>
        </>
      )}
      {children}
    </ControlledMenu>
  );
};

export default React.memo(NowPlayingMenu);
