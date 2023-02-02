import { IconButton, SvgIcon } from '@mui/material';
import { BsChatRightQuote } from 'react-icons/all';
import { useLocation, useNavigate } from 'react-router-dom';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';

const popperProps = {
  modifiers: [
    {
      name: 'offset',
      options: {
        offset: [0, 0],
      },
    },
  ],
};

const LyricsButton = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === '/lyrics';
  return (
    <Tooltip
      PopperProps={popperProps}
      placement="top"
      title="Lyrics"
    >
      <IconButton
        disableRipple
        size="small"
        sx={{
          ...iconButtonStyle,
          marginRight: '4px',
          width: '32px',
          height: '30px',
          color: isActive ? 'primary.main' : 'text.secondary',
          '&:hover': {
            backgroundColor: 'transparent',
            color: isActive ? 'primary.light' : 'text.primary',
          },
        }}
        onClick={() => navigate(isActive ? -1 as any : '/lyrics')}
      >
        <SvgIcon sx={{ height: '0.9em', width: '0.9em' }}>
          <BsChatRightQuote />
        </SvgIcon>
      </IconButton>
    </Tooltip>
  );
};

export default LyricsButton;
