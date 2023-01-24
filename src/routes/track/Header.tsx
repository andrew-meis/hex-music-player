import { Avatar, Box, Fade, Typography } from '@mui/material';
import chroma from 'chroma-js';
import fontColorContrast from 'font-color-contrast';
import { Track } from 'hex-plex';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import TrackRating from 'components/rating/TrackRating';
import { useThumbnail } from 'hooks/plexHooks';
import { PaletteState } from 'hooks/usePalette';
import FixedHeader from './FixedHeader';

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
  const [grandparentThumbSrc] = useThumbnail(track.grandparentThumb || 'none', 100);
  const [thumbSrc] = useThumbnail(track.parentThumb || 'none', 300);
  const [thumbSrcSm] = useThumbnail(track.parentThumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth={900}
          position="fixed"
          width="89%"
          zIndex={400}
        >
          <FixedHeader
            thumbSrcSm={thumbSrcSm}
            track={track}
          />
        </Box>
      </Fade>
      <Box
        alignItems="flex-end"
        borderBottom="1px solid"
        borderColor="border.main"
        color="text.primary"
        display="flex"
        height={232}
        ref={ref}
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
              <Typography variant="subtitle2">
                &nbsp;
                {track.media[0].audioCodec.toUpperCase()}
                &nbsp;
              </Typography>
              {
                track.media[0].parts[0].streams[0].bitDepth
                && track.media[0].parts[0].streams[0].samplingRate
                && (
                  <Typography variant="subtitle2">
                    {track.media[0].parts[0].streams[0].bitDepth}
                    /
                    {track.media[0].parts[0].streams[0].samplingRate.toString().slice(0, 2)}
                    &nbsp;
                    ·
                    &nbsp;
                  </Typography>
                )
              }
              <Box height={21}>
                <TrackRating id={track.id} userRating={track.userRating} />
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
};

export default Header;
