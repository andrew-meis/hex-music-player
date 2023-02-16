import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';
import { AnimatePresence } from 'framer-motion';
import { Artist, Track } from 'hex-plex';
import React, { useEffect, useRef, useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { usePrevious } from 'react-use';
import {
  MotionBox, MotionSvg, MotionTypography,
} from 'components/motion-components/motion-components';
import { iconMotion, tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import TrackHighlights from 'components/track-highlights/TrackHighlights';
import { PlexSortKeys, SortOrders } from 'types/enums';
import { ArtistContext } from '../Artist';

const TabChip = ({ active, label } : { active: boolean, label: string }) => (
  <Chip
    color={active ? 'primary' : 'default'}
    label={label}
    sx={{
      fontSize: '0.9rem',
      fontWeight: 400,
      marginRight: '8px',
      padding: 0,
      textTransform: 'none',
    }}
    onClick={() => {}}
  />
);

  interface TabPanelProps {
    children(activeIndex: number, difference: number): React.ReactNode;
    index: number;
    tracks: Track[];
    value: number;
  }

const TabPanel = (props: TabPanelProps) => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const { children, value, tracks, index, ...other } = props;
  const difference = prevIndex ? activeIndex - prevIndex : 1;

  useEffect(() => {
    if (!scrollRef.current) return;
    scrollRef.current.scrollTo({
      left: activeIndex * scrollRef.current.clientWidth,
      behavior: 'smooth',
    });
  }, [activeIndex]);

  return (
    <div
      hidden={value !== index}
      style={{
        display: 'flex',
        flexWrap: 'wrap',
      }}
      {...other}
    >
      {value === index && (
        <>
          <Box
            display="flex"
            flex="1 1 100%"
            overflow="hidden"
            ref={scrollRef}
          >
            <>{children(activeIndex, difference)}</>
          </Box>
          <PaginationDots
            activeIndex={activeIndex}
            array={tracks}
            colLength={4}
            setActiveIndex={setActiveIndex}
          />
        </>
      )}
    </div>
  );
};

interface TrackTabsProps {
  artist: Artist;
  context: ArtistContext;
}

const TrackTabs = ({ artist, context }: TrackTabsProps) => {
  const listLength = context!.topTracks!.length >= 4 || context!.recentFavorites!.length >= 4
    ? 4
    : Math.max(context!.topTracks!.length, context!.recentFavorites!.length);
  const minListHeight = listLength * 56;
  const [tab, setTab] = useState(0);
  return (
    <Box
      color="text.primary"
      display="flex"
      flex="50000 0 410px"
      flexDirection="column"
      height={minListHeight + 127}
      sx={{
        transform: 'translateZ(0px)',
      }}
    >
      <MotionTypography
        color="text.primary"
        fontFamily="TT Commons"
        fontSize="1.625rem"
        paddingX="1px"
        whileHover="hover"
        width="fit-content"
      >
        <Link
          className="link"
          state={{
            guid: artist.guid,
            title: artist.title,
            sort: [
              PlexSortKeys.RELEASE_DATE,
              SortOrders.DESC,
            ].join(''),
          }}
          to={`/artists/${artist.id}/tracks`}
        >
          All Tracks
          <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
            <BiChevronRight />
          </MotionSvg>
        </Link>
      </MotionTypography>
      <Tabs
        TabIndicatorProps={{ sx: { height: 0 } }}
        textColor="primary"
        value={tab}
        onChange={(_event, newValue) => setTab(newValue)}
      >
        <Tab
          disableRipple
          label={<TabChip active={tab === 0} label="Top Tracks" />}
          sx={{ cursor: 'default', height: 56, padding: 0 }}
        />
        {context!.recentFavorites!.length > 0 && (
        <Tab
          disableRipple
          label={<TabChip active={tab === 1} label="Recent Favorites" />}
          sx={{ cursor: 'default', height: 56, padding: 0 }}
        />
    )}
      </Tabs>
      <TabPanel index={0} tracks={context!.topTracks!} value={tab}>
        {(activeIndex, difference) => (
          <AnimatePresence custom={difference} initial={false} mode="wait">
            <MotionBox
              animate={{ x: 0, opacity: 1 }}
              custom={difference}
              exit="exit"
              initial="enter"
              key={activeIndex}
              transition={{ duration: 0.2 }}
              variants={tracklistMotion}
            >
              <TrackHighlights
                activeIndex={activeIndex}
                context={context}
                tracks={context!.topTracks!}
              />
            </MotionBox>
          </AnimatePresence>
        )}
      </TabPanel>
      <TabPanel index={1} tracks={context!.recentFavorites!} value={tab}>
        {(activeIndex, difference) => (
          <AnimatePresence custom={difference} initial={false} mode="wait">
            <MotionBox
              animate={{ x: 0, opacity: 1 }}
              custom={difference}
              exit="exit"
              initial="enter"
              key={activeIndex}
              transition={{ duration: 0.2 }}
              variants={tracklistMotion}
            >
              <TrackHighlights
                activeIndex={activeIndex}
                context={context}
                tracks={context!.recentFavorites!}
              />
            </MotionBox>
          </AnimatePresence>
        )}
      </TabPanel>
      <Typography
        color="text.secondary"
        fontFamily="TT Commons"
        fontSize="0.9rem"
        position="absolute"
        sx={{
          right: 4,
          top: 55,
        }}
        variant="button"
      >
        <Link
          className="link"
          state={{
            guid: artist.guid,
            title: artist.title,
            sort: [
              PlexSortKeys.PLAYCOUNT,
              SortOrders.DESC,
            ].join(''),
          }}
          to={tab === 0 ? `/artists/${artist.id}/tracks` : `/artists/${artist.id}/recent`}
        >
          See More
        </Link>
      </Typography>
    </Box>
  );
};

export default TrackTabs;
