import {
  Box, Fab, IconButton, SvgIcon,
} from '@mui/material';
import { FiRadio, RiPlayFill, RiShuffleFill } from 'react-icons/all';
import useKeyPress from 'hooks/useKeyPress';

const { platform } = window.electron.getAppInfo();

interface PlayShuffleButtonProps {
  handlePlay: () => Promise<void>;
  // eslint-disable-next-line react/require-default-props
  handleRadio?: () => Promise<void>;
  handleShuffle: () => Promise<void>;
}

const PlayShuffleButton = ({
  handlePlay,
  handleRadio,
  handleShuffle,
}: PlayShuffleButtonProps) => {
  const ctrlPress = useKeyPress(platform === 'darwin' ? 'Meta' : 'Control');
  return (
    <Box
      alignItems="center"
      display="flex"
      flexShrink={0}
      height={60}
      justifyContent="center"
      marginLeft="auto"
      sx={{ transform: 'translateZ(0px)' }}
      width={60}
    >
      <Fab
        color="primary"
        size="medium"
        sx={{
          transition: '200ms',
          zIndex: 0,
          '&:hover': {
            backgroundColor: 'primary.light',
            transform: 'scale(1.1)',
          },
        }}
        onClick={handlePlay}
      >
        <SvgIcon sx={{ width: '1.3em', height: '1.3em', color: 'background.default' }}>
          <RiPlayFill />
        </SvgIcon>
      </Fab>
      <IconButton
        sx={{
          position: 'absolute',
          right: '2px',
          bottom: '2px',
          width: '22px',
          height: '22px',
          color: 'primary.main',
          backgroundColor: 'background.default',
          transition: '200ms',
          '&:hover': {
            color: 'primary.light',
            backgroundColor: 'background.default',
            transform: 'scale(1.2)',
          },
        }}
        onClick={handleShuffle}
      >
        <SvgIcon sx={{ fontSize: '1rem' }} viewBox="0 0 16 16">
          <RiShuffleFill />
        </SvgIcon>
      </IconButton>
      {ctrlPress && !!handleRadio && (
        <IconButton
          sx={{
            position: 'absolute',
            right: '2px',
            bottom: '2px',
            width: '22px',
            height: '22px',
            color: 'primary.main',
            backgroundColor: 'background.default',
            transition: '200ms',
            '&:hover': {
              color: 'primary.light',
              backgroundColor: 'background.default',
              transform: 'scale(1.2)',
            },
          }}
          onClick={handleRadio}
        >
          <SvgIcon sx={{ fontSize: '1rem' }} viewBox="0 0 16 16">
            <FiRadio />
          </SvgIcon>
        </IconButton>
      )}
    </Box>
  );
};

export default PlayShuffleButton;
