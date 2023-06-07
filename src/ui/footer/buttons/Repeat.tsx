import { IconButton, SvgIcon } from '@mui/material';
import { RiRepeat2Fill, RiRepeatOneFill } from 'react-icons/all';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import { useSettings } from 'queries/app-queries';

const popperProps = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, -8],
      },
    },
  ],
};

interface RepeatProps {
  handleRepeat: (value: 'repeat-none' | 'repeat-one' | 'repeat-all') => Promise<void>;
}

const Repeat = ({ handleRepeat }: RepeatProps) => {
  const { data: settings } = useSettings();

  return (
    <Tooltip
      PopperProps={popperProps}
      placement="top"
      title="Repeat"
    >
      <span>
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
      </span>
    </Tooltip>
  );
};

export default Repeat;
