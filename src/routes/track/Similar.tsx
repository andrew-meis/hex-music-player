import { Box, CircularProgress, Grid, SvgIcon, Typography } from '@mui/material';
import { MenuDivider, MenuItem } from '@szhsin/react-menu';
import { AnimateSharedLayout } from 'framer-motion';
import { Track } from 'hex-plex';
import { throttle } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TbWaveSawTool, TiInfoLarge } from 'react-icons/all';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import ActionMenu from 'components/action-menu/ActionMenu';
import { MotionBox } from 'components/motion-components/motion-components';
import { ButtonSpecs, trackButtons } from 'constants/buttons';
import { typographyStyle } from 'constants/style';
import usePlayback, { PlayParams } from 'hooks/usePlayback';
import { useLastfmSimilar } from 'queries/last-fm-queries';
import { useSearch } from 'queries/plex-queries';
import { PlayActions } from 'types/enums';
import { LastFmCorrection } from 'types/lastfm-interfaces';

interface MenuItemsProps {
  artist: string;
  navigate: NavigateFunction;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  title: string;
}

const MenuItems = ({ artist, navigate, playSwitch, title }: MenuItemsProps) => {
  const { data, isLoading } = useSearch({
    query: [artist, title].join(' '),
    onSuccess: () => {},
  });
  const matchingTrack = useMemo(() => {
    if (!data || data.length === 0) return undefined;
    const tracks = data.filter((result) => result.type === 'track');
    if (!tracks || tracks.length === 0) return undefined;
    const nameMatch = tracks?.find((track) => {
      const lastfmTitle = title.replace(/["'’“”]/g, '').toLowerCase();
      const plexTitle = track.title.replace(/["'’“”]/g, '').toLowerCase();
      return lastfmTitle === plexTitle;
    });
    if (nameMatch) return nameMatch as Track;
    const partialMatch = tracks
      ?.find((track) => {
        const lastfmTitle = title.replace(/["'’“”]/g, '').toLowerCase();
        const plexTitle = track.title.replace(/["'’“”]/g, '').toLowerCase();
        return lastfmTitle.includes(plexTitle);
      });
    if (partialMatch) return partialMatch as Track;
    return undefined;
  }, [data, title]);

  if (isLoading) {
    return (
      <Box
        alignItems="center"
        display="flex"
        height={26}
        justifyContent="center"
      >
        ...searching...
      </Box>
    );
  }

  if (!matchingTrack) {
    return (
      <Box
        alignItems="center"
        display="flex"
        height={26}
        justifyContent="center"
      >
        ...no match found...
      </Box>
    );
  }

  return (
    <>
      {trackButtons.map((button: ButtonSpecs) => (
        <MenuItem
          key={button.name}
          onClick={() => playSwitch(button.action, {
            track: matchingTrack, shuffle: button.shuffle,
          })}
        >
          {button.icon}
          {button.name}
        </MenuItem>
      ))}
      <MenuDivider />
      <MenuItem onClick={() => navigate(`/tracks/${matchingTrack.id}`)}>
        <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
        Track information
      </MenuItem>
      <MenuItem onClick={() => navigate(`/tracks/${matchingTrack.id}/similar`)}>
        <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
        Similar tracks
      </MenuItem>
    </>
  );
};

const getCols = (width: number) => {
  if (width >= 800) {
    return 4;
  }
  if (width < 800 && width >= 600) {
    return 3;
  }
  if (width < 600) {
    return 2;
  }
  return 4;
};

const toTitleCase = (text: string) => {
  if (text === text.toUpperCase()) return text;
  if (text === text.toLowerCase()) return text;
  const newText = text
    .split(' ')
    .filter((n) => n)
    .map(([h, ...t]) => h.toUpperCase() + t.join('').toLowerCase())
    .join(' ');
  return newText;
};

interface SimilarProps {
  apikey: string | undefined;
  correction: LastFmCorrection;
  width: number | undefined;
}

const Similar = ({ apikey, correction, width }: SimilarProps) => {
  const cols = throttle(() => getCols(width || 900), 300, { leading: true })();
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const { playSwitch } = usePlayback();
  const { data: similarTracks, isLoading } = useLastfmSimilar({
    apikey,
    artist: correction.artist.name,
    title: correction.name,
  });

  const CARD_WIDTH = useMemo(() => {
    if (!width || !cols) return 200;
    return Math.floor((width / cols) - (8 / cols));
  }, [cols, width]);

  useEffect(() => {
    if (!scrollRef.current || !cols) return;
    scrollRef.current.scrollTo({
      left: (activeIndex * CARD_WIDTH) * cols,
      behavior: 'smooth',
    });
  }, [activeIndex, CARD_WIDTH, cols]);

  if (isLoading) {
    return (
      <>
        <Typography
          color="text.primary"
          fontFamily="TT Commons"
          fontSize="1.625rem"
        >
          Last.fm Similar Tracks
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          height={264}
          justifyContent="center"
        >
          <CircularProgress />
        </Box>
      </>
    );
  }

  if (!similarTracks || similarTracks.length === 0) {
    return (
      <>
        <Typography
          color="text.primary"
          fontFamily="TT Commons"
          fontSize="1.625rem"
        >
          Last.fm Similar Tracks
        </Typography>
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          height={264}
          justifyContent="center"
        >
          <Typography color="text.primary" fontFamily="TT Commons" fontWeight={700} variant="h4">
            No results!
          </Typography>
          <Typography color="text.primary">
            No similar tracks were found on last.fm.
          </Typography>
        </Box>
      </>
    );
  }

  if (!width || !cols) {
    return null;
  }

  return (
    <>
      <Typography
        color="text.primary"
        fontFamily="TT Commons"
        fontSize="1.625rem"
      >
        Last.fm Similar Tracks
      </Typography>
      <Grid
        container
        className="scroll-container"
        direction="column"
        height={240}
        overflow="hidden"
        ref={scrollRef}
      >
        {similarTracks.map((track) => (
          <Grid item color="text.secondary" key={track.url} width={CARD_WIDTH}>
            <Box
              borderRadius="4px"
              display="flex"
              height={40}
              mb="4px"
              mr="4px"
              paddingLeft="10px"
              paddingRight="4px"
              paddingY="8px"
              sx={{
                backgroundColor: 'action.hover',
                '&:hover': {
                  backgroundColor: 'action.selected',
                  '& > button': {
                    opacity: 1,
                  },
                },
                '& > button': {
                  opacity: 0,
                },
              }}
            >
              <Box width={0.9}>
                <Typography
                  color="text.primary"
                  fontFamily="Rubik"
                  fontSize="0.95rem"
                  sx={typographyStyle}
                >
                  {toTitleCase(track.name)}
                </Typography>
                <Typography fontSize="0.875rem" sx={typographyStyle}>
                  {track.artist.name}
                </Typography>
              </Box>
              <ActionMenu
                arrow
                portal
                align="center"
                direction="right"
                offsetX={2}
                width={16}
              >
                <MenuItems
                  artist={track.artist.name}
                  navigate={navigate}
                  playSwitch={playSwitch}
                  title={track.name}
                />
              </ActionMenu>
            </Box>
          </Grid>
        ))}
      </Grid>
      <AnimateSharedLayout>
        <Box
          alignItems="center"
          display="flex"
          height={24}
          justifyContent="center"
          width={1}
        >
          {similarTracks.map((track, index) => {
            if (index % (4 * cols) !== 0) return null;
            return (
              <Box
                key={track.url}
                paddingX="12px"
                sx={{ cursor: 'pointer' }}
                onClick={() => setActiveIndex(index / (4 * cols))}
              >
                <Box
                  bgcolor="action.disabled"
                  borderRadius="50%"
                  height={8}
                  width={8}
                >
                  {(index / (4 * cols)) === activeIndex && (
                    <MotionBox
                      layoutId="highlight"
                      sx={{
                        backgroundColor: 'text.secondary',
                        borderRadius: '50%',
                        height: 12,
                        width: 12,
                        position: 'relative',
                        top: '-2px',
                        left: '-2px',
                      }}
                    />
                  )}
                </Box>
              </Box>
            );
          })}
        </Box>
      </AnimateSharedLayout>
    </>
  );
};

export default Similar;
