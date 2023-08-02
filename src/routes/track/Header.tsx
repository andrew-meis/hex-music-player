import { Avatar, Box, Fade, IconButton, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import chroma, { contrast } from 'chroma-js';
import React, { useEffect, useRef } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { BsChatRightQuote } from 'react-icons/bs';
import { useInView } from 'react-intersection-observer';
import { useNavigate } from 'react-router-dom';
import { Album, Library, Track } from 'api/index';
import { ChipGenres } from 'components/chips';
import { MenuIcon, TrackMenu } from 'components/menus';
import TrackRating from 'components/rating/TrackRating';
import { WIDTH_CALC } from 'constants/measures';
import { iconButtonStyle } from 'constants/style';
import { useThumbnail } from 'hooks/plexHooks';
import { PaletteState } from 'hooks/usePalette';
import { PlayParams } from 'hooks/usePlayback';
import { DragTypes, PlayActions } from 'types/enums';
import FixedHeader from './FixedHeader';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons, sans-serif',
  fontWeight: 600,
  marginBottom: '5px',
};

const Header: React.FC<{
  album: Album,
  colors: PaletteState,
  isLyrics: boolean,
  library: Library,
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  track: Track,
}> = ({
  album,
  colors,
  isLyrics,
  library,
  playSwitch,
  setOpen,
  track,
}) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const [menuProps, toggleMenu] = useMenuState({ transition: true, unmountOnClose: true });
  const [grandparentThumbSrc] = useThumbnail(track.grandparentThumb || 'none', 100);
  const [thumbSrc] = useThumbnail(track.parentThumb || 'none', 300);
  const [thumbSrcSm] = useThumbnail(track.parentThumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.TRACK,
    item: () => [track],
  }), [track]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, track]);

  const color = chroma(colors.muted).saturate(2).brighten(1).hex();
  const contrastColor = contrast(color, 'black') > contrast(color, 'white')
    ? 'black'
    : 'white';

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          position="fixed"
          width={WIDTH_CALC}
          zIndex={400}
        >
          <FixedHeader
            thumbSrcSm={thumbSrcSm}
            track={track}
          />
        </Box>
      </Fade>
      <Box
        height={272 + 8}
        ref={ref}
      >
        <Box
          alignItems="flex-end"
          borderRadius="24px"
          color="text.primary"
          display="flex"
          height={272}
          position="relative"
          ref={drag}
          sx={{
            backgroundImage:
            /* eslint-disable max-len */
            `radial-gradient(circle at 115% 85%, rgba(var(--mui-palette-action-activeChannel) / 0.03), rgba(var(--mui-palette-action-activeChannel) / 0.08) 40%),
              radial-gradient(circle at 5% 5%, rgba(var(--mui-palette-action-activeChannel) / 0.01), rgba(var(--mui-palette-action-activeChannel) / 0.03) 70%)`,
            /* eslint-enable max-len */
          }}
          top={8}
        >
          <Avatar
            alt={track.parentTitle}
            src={thumbSrc}
            sx={{
              height: 236,
              m: '18px',
              width: 236,
            }}
            variant="rounded"
          />
          <Box alignItems="flex-end" display="flex" flexGrow={1} mb="12px">
            <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
              <Box display="flex" height={18}>
                <Typography variant="subtitle2">
                  track
                </Typography>
              </Box>
              <Typography sx={titleStyle} variant="h4">{track.title}</Typography>
              <Box alignItems="center" display="flex" height={36}>
                <Box
                  alignItems="center"
                  borderRadius="16px"
                  display="flex"
                  height="36px"
                  sx={{
                    background: !colors ? 'active.selected' : color,
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
                    sx={{ width: '32px', height: '32px', ml: '2px' }}
                  />
                  <Typography
                    color={!colors ? 'text.main' : contrastColor}
                    fontSize="0.875rem"
                    ml="8px"
                    mr="12px"
                    whiteSpace="nowrap"
                  >
                    {track.grandparentTitle}
                  </Typography>
                </Box>
              </Box>
              <Box
                display="flex"
                flexWrap="wrap"
                height={22}
                justifyContent="center"
                mt="4px"
                overflow="hidden"
              >
                <Typography fontFamily="Rubik, sans-serif" variant="subtitle2">
                  {track.media[0].audioCodec.toUpperCase()}
                  &nbsp;
                </Typography>
                {
                  track.media[0].parts[0].streams[0].bitDepth
                  && track.media[0].parts[0].streams[0].samplingRate
                  && (
                    <Typography fontFamily="Rubik, sans-serif" variant="subtitle2">
                      {track.media[0].parts[0].streams[0].bitDepth}
                      /
                      {track.media[0].parts[0].streams[0].samplingRate.toString().slice(0, 2)}
                    </Typography>
                  )
                }
                <Typography variant="subtitle2">
                  &nbsp;
                  ·
                  &nbsp;
                </Typography>
                <div style={{ marginTop: '1px' }}>
                  <TrackRating
                    id={track.id}
                    library={library}
                    userRating={track.userRating / 2 || 0}
                  />
                </div>
              </Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box
        alignItems="center"
        display="flex"
        height={72}
        justifyContent="space-between"
      >
        <ChipGenres
          colors={Object.values(colors!)}
          genres={album.genre}
          navigate={navigate}
        />
        <div style={{ display: 'flex' }}>
          {isLyrics && (
            <IconButton
              disableRipple
              size="small"
              sx={{
                ...iconButtonStyle,
                marginRight: '4px',
                marginTop: '2px',
                width: '32px',
                height: '30px',
              }}
              onClick={() => setOpen(true)}
            >
              <SvgIcon sx={{ height: '0.9em', width: '0.9em' }}>
                <BsChatRightQuote />
              </SvgIcon>
            </IconButton>
          )}
          <MenuIcon
            height={32}
            menuRef={menuRef}
            menuState={menuProps.state}
            toggleMenu={toggleMenu}
            width={24}
          />
        </div>
        <TrackMenu
          arrow
          portal
          align="center"
          anchorRef={menuRef}
          direction="left"
          playSwitch={playSwitch}
          toggleMenu={toggleMenu}
          tracks={[track]}
          {...menuProps}
        />
      </Box>
    </>
  );
};

export default Header;
