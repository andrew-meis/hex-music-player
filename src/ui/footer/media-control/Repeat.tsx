import { IconButton, SvgIcon } from '@mui/material';
import { useAtomValue } from 'jotai';
import { RiRepeat2Fill, RiRepeatOneFill } from 'react-icons/ri';
import { iconButtonStyle } from 'constants/style';
import { settingsAtom } from 'root/Root';

interface RepeatProps {
  handleRepeat: (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => void;
}

const Repeat = ({ handleRepeat }: RepeatProps) => {
  const settings = useAtomValue(settingsAtom);

  return (
    <>
      {settings.repeat === 'repeat-none'
        && (
          <IconButton
            disableRipple
            size="small"
            sx={{ ...iconButtonStyle }}
            onClick={() => handleRepeat('repeat-all')}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeat2Fill /></SvgIcon>
          </IconButton>
        )}
      {settings.repeat === 'repeat-all'
        && (
          <IconButton
            disableRipple
            size="small"
            sx={{
              ...iconButtonStyle,
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
            }}
            onClick={() => handleRepeat('repeat-one')}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeat2Fill /></SvgIcon>
          </IconButton>
        )}
      {settings.repeat === 'repeat-one'
        && (
          <IconButton
            disableRipple
            size="small"
            sx={{
              ...iconButtonStyle,
              color: 'primary.main',
              '&:hover': {
                backgroundColor: 'transparent',
                color: 'primary.main',
              },
            }}
            onClick={() => handleRepeat('repeat-none')}
          >
            <SvgIcon sx={{ width: '0.9em', height: '1em' }}><RiRepeatOneFill /></SvgIcon>
          </IconButton>
        )}
    </>
  );
};

export default Repeat;
