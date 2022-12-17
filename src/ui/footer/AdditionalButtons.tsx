import { Box, SvgIcon } from '@mui/material';
import { RiChatQuoteFill } from 'react-icons/all';
import { useLocation, useNavigate } from 'react-router-dom';
import Tooltip from 'components/tooltip/Tooltip';
import QueueDrawer from './QueueDrawer';
import VolumeSlider from './VolumeSlider';

const AdditionalButtons = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isActive = location.pathname === '/lyrics';
  return (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        justifyContent: 'flex-end',
        alignItems: 'center',
      }}
    >
      <Tooltip
        placement="top"
        title="Lyrics"
      >
        <Box
          sx={{
            alignItems: 'center',
            color: isActive
              ? 'primary.main'
              : 'text.secondary',
            display: 'flex',
            height: '30px',
            justifyContent: 'center',
            position: 'absolute',
            right: '182px',
            width: '30px',
            '&:hover': {
              color: isActive
                ? 'primary.light'
                : 'text.primary',
            },
          }}
          onClick={() => navigate(isActive ? -1 as any : '/lyrics')}
        >
          <SvgIcon>
            <RiChatQuoteFill />
          </SvgIcon>
        </Box>
      </Tooltip>
      <QueueDrawer />
      <VolumeSlider />
    </Box>
  );
};

export default AdditionalButtons;
