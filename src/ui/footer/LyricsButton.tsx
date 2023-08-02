import { IconButton, SvgIcon } from '@mui/material';
import { BsChatRightQuote } from 'react-icons/bs';
import { useLocation, useNavigate } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import Tooltip from 'components/tooltip/Tooltip';
import { iconButtonStyle } from 'constants/style';
import { useNowPlaying } from 'queries/plex-queries';
import { useLyrics } from 'queries/track-queries';

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
  const { data: nowPlaying } = useNowPlaying();
  const { data: lyricsData } = useLyrics({ track: nowPlaying?.track });

  return (
    <>
      {lyricsData && (lyricsData.syncedLyrics || lyricsData.plainLyrics) && (
        <MotionBox
          animate={{ width: 32, opacity: 1 }}
          exit={{ width: 0, opacity: 0 }}
          initial={{ width: 0, opacity: 0 }}
          mr={0.5}
        >
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
        </MotionBox>
      )}
    </>
  );
};

export default LyricsButton;
