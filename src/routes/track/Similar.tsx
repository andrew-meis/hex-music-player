import { Box, CircularProgress, Grid, SvgIcon, Typography } from '@mui/material';
import { ControlledMenu, MenuDivider, MenuItem, useMenuState } from '@szhsin/react-menu';
import { AnimatePresence, AnimateSharedLayout } from 'framer-motion';
import { Track } from 'hex-plex';
import { throttle } from 'lodash';
import { useEffect, useMemo, useRef, useState } from 'react';
import { TbWaveSawTool, TiInfoLarge } from 'react-icons/all';
import { NavigateFunction, useNavigate } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import { ButtonSpecs, trackButtons } from 'constants/buttons';
import { typographyStyle } from 'constants/style';
import { PlayParams } from 'hooks/usePlayback';
import { useLastfmSimilar } from 'queries/last-fm-queries';
import { useSearch, useSearchTracks } from 'queries/plex-queries';
import { PlayActions } from 'types/enums';

interface MenuItemsProps {
  artist: string;
  navigate: NavigateFunction;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  title: string;
}

const MenuItems = ({ artist, navigate, playSwitch, title }: MenuItemsProps) => {
  const searchTitle = title
    .split(' (with')
    .join(' (feat')
    .split(' (ft')
    .join(' (feat')
    .split(' (feat')[0];
  const { data: tracks, isLoading } = useSearchTracks({
    artist,
    sectionId: 6,
    title: searchTitle,
  });
  const { data: results, isLoading: resultsLoading } = useSearch({
    query: `${artist} ${searchTitle}`.split(' ').filter((t) => t.length > 1).join(' '),
    onSuccess: () => {},
  });
  const matchingTrack = useMemo(() => {
    if (tracks && results) {
      const allTracks = [
        ...tracks,
        ...results.filter((result) => result.type === 'track'),
      ] as Track[];
      if (allTracks.length === 0) return undefined;
      const nameMatch = allTracks?.find((track) => {
        const lastfmTitle = title.replace(/["'’“”]/g, '').toLowerCase();
        const plexTitle = track.title.replace(/["'’“”]/g, '').toLowerCase();
        return lastfmTitle === plexTitle;
      });
      if (nameMatch) return nameMatch;
      const alphanumericMatch = allTracks?.find((track) => {
        const lastfmTitle = title.replace(/\W+/g, ' ').trim().toLowerCase();
        const plexTitle = track.title.replace(/\W+/g, ' ').trim().toLowerCase();
        return lastfmTitle === plexTitle;
      });
      if (alphanumericMatch) return alphanumericMatch;
      const partialMatch = allTracks?.find((track) => {
        const lastfmTitle = title.replace(/["'’“”]/g, '').toLowerCase();
        const plexTitle = track.title.replace(/["'’“”]/g, '').toLowerCase();
        return lastfmTitle.includes(plexTitle);
      });
      if (partialMatch) return partialMatch;
      return undefined;
    }
    return undefined;
  }, [results, tracks, title]);

  if (isLoading || resultsLoading) {
    return (
      <Box
        alignItems="center"
        display="flex"
        height={24}
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
        height={24}
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
    .map(([h, ...t]) => {
      if (h === '(' || h === '[') {
        return h + t[0] + t.slice(1).join('').toLowerCase();
      }
      return h.toUpperCase() + t.join('').toLowerCase();
    })
    .join(' ');
  return newText;
};

interface SimilarProps {
  apikey: string | undefined;
  artist: string | undefined;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  title: string | undefined;
  width: number | undefined;
}

const Similar = ({ apikey, artist, playSwitch, title, width }: SimilarProps) => {
  const cols = throttle(() => getCols(width || 900), 300, { leading: true })();
  const hoverIndex = useRef(0);
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ transition: true });
  const { data: similarTracks, isLoading } = useLastfmSimilar({
    apikey,
    artist,
    title,
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

  if (!similarTracks || similarTracks.length === 0 || !artist || !title) {
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
        {similarTracks.map((track, index) => (
          <Grid item color="text.secondary" key={track.url} width={CARD_WIDTH}>
            <Box
              alignItems="center"
              borderRadius="4px"
              display="flex"
              height={40}
              mb="4px"
              mr="4px"
              paddingX="12px"
              paddingY="8px"
              sx={{
                backgroundColor: menuProps.state === 'open' && hoverIndex.current === index
                  ? 'action.selected'
                  : 'action.hover',
                cursor: 'pointer',
                '&:hover': {
                  backgroundColor: 'action.selected',
                },
              }}
              onClick={(e) => {
                if (hoverIndex.current === index && menuProps.state === 'closing') {
                  return;
                }
                hoverIndex.current = index;
                setAnchorPoint({
                  x: e.currentTarget.getBoundingClientRect().x,
                  y: e.currentTarget.getBoundingClientRect().y + 28,
                });
                toggleMenu(true);
              }}
              onMouseEnter={() => {
                if (menuProps.state === 'open' || menuProps.state === 'opening') return;
                hoverIndex.current = index;
              }}
            >
              <AnimatePresence>
                {(menuProps.state === 'open' || menuProps.state === 'opening')
                  && hoverIndex.current === index
                  && (
                    <MotionBox
                      animate={{ opacity: 1, x: 0 }}
                      bgcolor="primary.main"
                      borderRadius="2px"
                      exit={{ opacity: 0 }}
                      height={28}
                      initial={{ opacity: 0, x: -10 }}
                      mr="8px"
                      width={4}
                    />
                  )}
              </AnimatePresence>
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
            </Box>
          </Grid>
        ))}
      </Grid>
      <ControlledMenu
        {...menuProps}
        arrow
        portal
        align="center"
        anchorPoint={anchorPoint}
        direction="left"
        offsetX={-10}
        onClose={() => toggleMenu(false)}
      >
        <MenuItems
          artist={similarTracks[hoverIndex.current].artist.name}
          navigate={navigate}
          playSwitch={playSwitch}
          title={similarTracks[hoverIndex.current].name}
        />
      </ControlledMenu>
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
