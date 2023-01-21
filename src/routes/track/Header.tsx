import { Avatar, Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import fontColorContrast from 'font-color-contrast';
import { Track } from 'hex-plex';
import { useNavigate } from 'react-router-dom';
import { useThumbnail } from 'hooks/plexHooks';
import useFormattedTime from 'hooks/useFormattedTime';
import { PaletteState } from 'hooks/usePalette';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons',
  fontWeight: 600,
  marginBottom: '5px',
};

interface HeaderProps {
  colors: PaletteState;
  track: Track;
}

const Header = ({ colors, track }: HeaderProps) => {
  const navigate = useNavigate();
  const grandparentThumbSrc = useThumbnail(track.grandparentThumb || 'none', 100);
  const thumbSrc = useThumbnail(track.parentThumb || 'none', 300);
  const { getFormattedTime } = useFormattedTime();
  // const thumbSrcSm = useThumbnail(track.parentThumb || 'none', 100);

  return (
    <Box
      alignItems="flex-end"
      borderBottom="1px solid"
      borderColor="border.main"
      color="text.primary"
      display="flex"
      height={232}
    >
      <Avatar
        alt={track.parentTitle}
        src={thumbSrc}
        sx={{
          height: 216, margin: '8px', ml: 0, width: 216,
        }}
        variant="rounded"
      />
      <Box alignItems="flex-end" display="flex" flexGrow={1} mb="10px">
        <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
          <Box display="flex" height={18}>
            <Typography variant="subtitle2">
              track
            </Typography>
          </Box>
          <Typography sx={titleStyle} variant="h4">{track.title}</Typography>
          <Box alignItems="center" display="flex" height={32}>
            <Box
              alignItems="center"
              borderRadius="16px"
              display="flex"
              height="28px"
              sx={{
                background: !colors
                  ? 'active.selected'
                  : chroma(colors.muted).saturate(2).brighten(1).hex(),
                cursor: 'pointer',
                transition: 'box-shadow 200ms ease-in',
                '&:hover': { boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)' },
              }}
              onClick={() => navigate(
                `/artists/${track.grandparentId}`,
                { state: { guid: track.grandparentGuid, title: track.grandparentTitle } },
              )}
            >
              <Avatar
                alt={track.grandparentTitle}
                src={grandparentThumbSrc}
                sx={{ width: '24px', height: '24px', ml: '2px' }}
              />
              <Typography
                color={!colors
                  ? 'text.main'
                  : fontColorContrast(chroma(colors.muted).saturate(2).brighten(1).hex())}
                fontSize="0.875rem"
                ml="8px"
                mr="12px"
                whiteSpace="nowrap"
              >
                {track.grandparentTitle}
              </Typography>
            </Box>
          </Box>
          <Box alignItems="flex-end" display="flex" height={25}>
            <Typography
              sx={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
              }}
              variant="subtitle2"
              width="fit-content"
            >
              {
                // eslint-disable-next-line max-len
                `${track.parentTitle} · ${getFormattedTime(track.duration)} · ${track.viewCount} ${track.viewCount > 1 ? 'plays' : 'play'}`
              }
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default Header;
