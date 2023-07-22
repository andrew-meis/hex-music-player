/* eslint-disable no-underscore-dangle */
import { Box, Button, SvgIcon } from '@mui/material';
import { useAtomValue } from 'jotai';
import { BsPlayFill } from 'react-icons/bs';
import { FiRadio } from 'react-icons/fi';
import { RiShuffleFill } from 'react-icons/ri';
import { TiArrowForward } from 'react-icons/ti';
import { MotionBox } from 'components/motion-components/motion-components';
import usePlayback from 'hooks/usePlayback';
import { settingsAtom } from 'root/Root';
import { PlayActions } from 'types/enums';
import { isAlbum, isArtist, isGenre, isPlaylist, isTrack } from 'types/type-guards';
import { Result } from 'types/types';

const allButtons = [
  {
    type: 'track',
    icon: <SvgIcon sx={{ ml: '-5px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_TRACK,
    shuffle: false,
  },
  {
    type: 'track',
    icon: <SvgIcon sx={{ ml: '-2px', mb: '2px' }}><TiArrowForward /></SvgIcon>,
    name: 'Play next',
    action: PlayActions.ADD_TRACK,
    shuffle: false,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ ml: '-5px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_ALBUM,
    shuffle: false,
  },
  {
    type: 'album',
    icon: <SvgIcon sx={{ width: '0.9em', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.PLAY_ALBUM,
    shuffle: true,
  },
  {
    type: 'artist',
    icon: <SvgIcon sx={{ ml: '-5px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_ARTIST,
    shuffle: false,
  },
  {
    type: 'artist',
    icon: <SvgIcon><FiRadio /></SvgIcon>,
    name: 'Artist radio',
    action: PlayActions.PLAY_ARTIST_RADIO,
    shuffle: false,
  },
  {
    type: 'playlist',
    icon: <SvgIcon sx={{ ml: '-5px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.PLAY_PLAYLIST,
    shuffle: false,
  },
  {
    type: 'playlist',
    icon: <SvgIcon sx={{ width: '0.9em', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.PLAY_PLAYLIST,
    shuffle: true,
  },
  {
    type: 'genre',
    icon: <SvgIcon sx={{ ml: '-5px' }}><BsPlayFill /></SvgIcon>,
    name: 'Play now',
    action: PlayActions.DO_NOTHING,
    shuffle: false,
  },
  {
    type: 'genre',
    icon: <SvgIcon sx={{ width: '0.9em', height: '0.9em' }}><RiShuffleFill /></SvgIcon>,
    name: 'Shuffle',
    action: PlayActions.DO_NOTHING,
    shuffle: true,
  },
];

const HighlightCardButtons = ({ item }: { item: Result }) => {
  const settings = useAtomValue(settingsAtom);
  const { playSwitch } = usePlayback();
  const { colorMode } = settings;
  const buttons = allButtons.filter((button) => button.type === item._type);

  const handleButtonGroup = async (action: PlayActions, shuffle?: boolean) => {
    if (isArtist(item)) {
      await playSwitch(action, { artist: item });
      return;
    }
    if (isAlbum(item)) {
      await playSwitch(action, { album: item, shuffle });
      return;
    }
    if (isTrack(item)) {
      await playSwitch(action, { track: item });
      return;
    }
    if (isPlaylist(item)) {
      await playSwitch(action, { playlist: item, shuffle });
      return;
    }
    if (isGenre(item)) {
      await playSwitch(action, { genre: item, shuffle });
      return;
    }
    throw new Error('no matching type');
  };

  return (
    <>
      <MotionBox
        transition={{ type: 'spring', stiffness: 100 }}
        whileHover={{ scale: [null, 1.08, 1.04] }}
      >
        <Button
          size="small"
          sx={{
            borderRadius: '10px',
            ml: '6px',
            minWidth: '116px',
            maxWidth: '116px',
            height: '36px',
            color: 'common.black',
            textTransform: 'none',
            backgroundColor: 'rgb(252, 252, 252)',
            '&:hover': {
              backgroundColor: 'rgb(252, 252, 252)',
            },
          }}
          variant="contained"
          onClick={() => handleButtonGroup(buttons[0].action, buttons[0].shuffle)}
        >
          <Box alignItems="center" display="flex" justifyContent="center" width={1}>
            {buttons[0].icon}
            <span style={{ width: '5px', flexShrink: 0 }} />
            {buttons[0].name}
          </Box>
        </Button>
      </MotionBox>
      <MotionBox
        transition={{ type: 'spring', stiffness: 100 }}
        whileHover={{ scale: [null, 1.08, 1.04] }}
      >
        <Button
          size="small"
          sx={{
            borderRadius: '10px',
            ml: '6px',
            minWidth: '116px',
            maxWidth: '116px',
            height: '36px',
            color: colorMode === 'light' ? 'text.secondary' : 'white.main',
            textTransform: 'none',
            backgroundColor: 'rgba(252, 252, 252, 0.65)',
            '&:hover': {
              backgroundColor: 'rgba(252, 252, 252, 0.65)',
            },
          }}
          variant="contained"
          onClick={() => handleButtonGroup(buttons[1].action, buttons[1].shuffle)}
        >
          <Box alignItems="center" display="flex" justifyContent="center" width={1}>
            {buttons[1].icon}
            <span style={{ width: buttons[1].name === 'Shuffle' ? 8 : 5, flexShrink: 0 }} />
            {buttons[1].name}
          </Box>
        </Button>
      </MotionBox>
    </>
  );
};

export default HighlightCardButtons;
