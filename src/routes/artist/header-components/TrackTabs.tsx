import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React, { useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
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
    children: React.ReactNode;
    index: number;
    value: number;
  }

const TabPanel = ({ children, index, value, ...rest }: TabPanelProps) => (
  <div
    hidden={value !== index}
    style={{
      display: 'flex',
      flexWrap: 'wrap',
    }}
    {...rest}
  >
    {value === index && (
      <Box>
        {children}
      </Box>
    )}
  </div>
);

interface TrackTabsProps {
  artist: Artist;
  context: ArtistContext;
}

const TrackTabs = ({ artist, context }: TrackTabsProps) => {
  const {
    getFormattedTime, isPlaying, library, nowPlaying, playSwitch, topTracks, recentFavorites,
  } = context!;
  const listLength = topTracks!.length >= 4 || recentFavorites!.length >= 4
    ? 4
    : Math.max(topTracks!.length, recentFavorites!.length);
  const minListHeight = listLength * 56;
  const [tab, setTab] = useState(0);
  return (
    <Box
      color="text.primary"
      display="flex"
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
      <TabPanel index={0} value={tab}>
        <TrackHighlights
          getFormattedTime={getFormattedTime}
          isPlaying={isPlaying}
          library={library}
          nowPlaying={nowPlaying}
          playSwitch={playSwitch}
          rows={4}
          tracks={topTracks!}
        />
      </TabPanel>
      <TabPanel index={1} value={tab}>
        <TrackHighlights
          getFormattedTime={getFormattedTime}
          isPlaying={isPlaying}
          library={library}
          nowPlaying={nowPlaying}
          playSwitch={playSwitch}
          rows={4}
          tracks={recentFavorites!}
        />
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
