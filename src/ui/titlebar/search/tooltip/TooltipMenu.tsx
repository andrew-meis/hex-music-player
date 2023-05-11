import {
  Box, Button, ButtonGroup, SvgIcon,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { MdPlaylistAdd, TbWaveSawTool } from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import { Album, Artist, Genre, Playlist, Track } from 'api/index';
import { allButtons, ButtonSpecs } from 'constants/buttons';
import usePlayback from 'hooks/usePlayback';
import { isAlbum, isArtist, isGenre, isPlaylist, isTrack } from 'types/type-guards';
import { Result } from 'types/types';

const buttonStyle = {
  width: '-webkit-fill-available',
  borderRadius: '4px !important',
  justifyContent: 'left',
  color: 'text.primary',
  cursor: 'default',
  border: 'none',
  textTransform: 'none',
  textAlign: 'right',
  padding: '6px 8px',
  transition: 'none',
  fontSize: '0.875rem',
  height: '36px',
  '&:hover': {
    border: 'none',
    backgroundColor: 'action.selected',
  },
};

interface Props {
  result: Result;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setTooltipOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TooltipMenu = ({ result, setOpen, setTooltipOpen }: Props) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { playSwitch } = usePlayback();

  const handleButton = async (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
    button: ButtonSpecs,
  ) => {
    event.stopPropagation();
    switch (true) {
      case isArtist(result):
        await playSwitch(button.action, { artist: result as Artist, shuffle: button.shuffle });
        break;
      case isAlbum(result):
        await playSwitch(button.action, { album: result as Album, shuffle: button.shuffle });
        break;
      case isGenre(result):
        await playSwitch(button.action, { genre: result as Genre, shuffle: button.shuffle });
        break;
      case isPlaylist(result):
        await playSwitch(button.action, { playlist: result as Playlist, shuffle: button.shuffle });
        break;
      case isTrack(result):
        await playSwitch(button.action, { track: result as Track, shuffle: button.shuffle });
        break;
      default:
        break;
    }
    document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
    setTooltipOpen(false);
    setOpen(false);
  };

  const handleButtonGeneric = (
    event: React.MouseEvent<HTMLButtonElement, MouseEvent>,
  ) => {
    event.stopPropagation();
    document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
    setTooltipOpen(false);
    setOpen(false);
  };

  // eslint-disable-next-line no-underscore-dangle
  const buttons = allButtons.filter((button) => button.type === result._type);

  return (
    <Box
      sx={{
        display: 'flex',
        '& > *': {
          m: 1,
        },
        '.MuiButtonGroup-root .MuiButtonGroup-grouped:not(:first-of-type)': {
          marginTop: 0,
        },
      }}
    >
      <ButtonGroup
        orientation="vertical"
        sx={{
          width: '100%',
          alignItems: 'flex-start',
          margin: '0',
        }}
      >
        {buttons.map((button: ButtonSpecs) => (
          <Button key={button.name} sx={buttonStyle} onClick={(e) => handleButton(e, button)}>
            {button.icon}
            {button.name}
          </Button>
        ))}
        {isAlbum(result) && (
          <>
            <div className="szh-menu__divider" style={{ width: '-webkit-fill-available' }} />
            <Button
              sx={buttonStyle}
              onClick={(event) => {
                handleButtonGeneric(event);
                queryClient.setQueryData(['playlist-dialog-open'], [result]);
              }}
            >
              <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
              Add to playlist
            </Button>
          </>
        )}
        {isTrack(result) && (
          <>
            <div className="szh-menu__divider" style={{ width: '-webkit-fill-available' }} />
            <Button
              sx={buttonStyle}
              onClick={(event) => {
                handleButtonGeneric(event);
                queryClient.setQueryData(['playlist-dialog-open'], [result]);
              }}
            >
              <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
              Add to playlist
            </Button>
            <Button
              sx={buttonStyle}
              onClick={(event) => {
                handleButtonGeneric(event);
                navigate(`/tracks/${result.id}/similar`);
              }}
            >
              <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
              Similar tracks
            </Button>
          </>
        )}
      </ButtonGroup>
    </Box>
  );
};

export default TooltipMenu;
