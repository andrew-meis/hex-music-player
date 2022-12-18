import { Box, Chip, Tab, Tabs, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React, { useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import { Link } from 'react-router-dom';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import { PlexSortKeys, SortOrders } from 'types/enums';
import { ArtistContext } from '../Artist';
import TrackHighlights from '../TrackHighlights';

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
    // eslint-disable-next-line react/require-default-props
    children?: React.ReactNode;
    index: number;
    value: number;
  }

const TabPanel = (props: TabPanelProps) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      hidden={value !== index}
      {...other}
    >
      {value === index && (
      <Box>
        {children}
      </Box>
      )}
    </div>
  );
};

interface TrackTabsProps {
  artist: Artist;
  context: ArtistContext;
  maxList: number;
}

const TrackTabs = ({ artist, context, maxList }: TrackTabsProps) => {
  const [tab, setTab] = useState(0);
  return (
    <Box
      color="text.primary"
      display="flex"
      flex="50000 0 410px"
      flexDirection="column"
      minHeight={
    (maxList * 56) + 95
    }
      sx={{
        transform: 'translateZ(0px)',
      }}
    >
      <MotionTypography
        color="text.primary"
        fontFamily="TT Commons"
        fontSize="1.625rem"
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
        onChange={(e, newValue) => setTab(newValue)}
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
          context={context}
          tracks={context!.topTracks}
        />
      </TabPanel>
      <TabPanel index={1} value={tab}>
        <TrackHighlights
          context={context}
          tracks={context!.recentFavorites}
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
