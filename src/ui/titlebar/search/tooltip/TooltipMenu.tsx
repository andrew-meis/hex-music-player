import {
  Box, Button, ButtonGroup, SvgIcon,
} from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { MdPlaylistAdd } from 'react-icons/all';
import usePlayback from 'hooks/usePlayback';
import { isAlbum, isArtist, isTrack } from 'types/type-guards';
import { allButtons, ButtonSpecs } from '../../../../constants/buttons';
import type { Result } from 'types/types';

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
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const TooltipMenu = ({ result, open, setOpen }: Props) => {
  const queryClient = useQueryClient();
  const { playSwitch } = usePlayback();

  const handleButton = async (
    event: React.SyntheticEvent<HTMLButtonElement>,
    button: ButtonSpecs,
  ) => {
    event.stopPropagation();
    if (isArtist(result)) {
      await playSwitch(button.action, { artist: result, shuffle: button.shuffle });
    }
    if (isAlbum(result)) {
      await playSwitch(button.action, { album: result, shuffle: button.shuffle });
    }
    if (isTrack(result)) {
      await playSwitch(button.action, { track: result, shuffle: button.shuffle });
    }
    document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
    setOpen(!open);
  };

  const buttons = allButtons.filter((button) => button.type === result.type);

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
        {isTrack(result) && (
          <Button
            sx={buttonStyle}
            onClick={(e) => {
              e.stopPropagation();
              queryClient.setQueryData(['playlist-dialog-open'], result);
              document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
              setOpen(!open);
            }}
          >
            <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
            Add to playlist
          </Button>
        )}
      </ButtonGroup>
    </Box>
  );
};

export default TooltipMenu;
