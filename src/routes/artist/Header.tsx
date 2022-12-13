import { Box, Chip, SvgIcon, Tab, Tabs, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import React, { useState } from 'react';
import { HiArrowSmDown, HiArrowSmUp } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import useMenuStyle from 'hooks/useMenuStyle';
import styles from 'styles/ArtistHeader.module.scss';
import { PlexSortKeys, SortOrders } from 'types/enums';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import Highlights from './header-components/Highlights';
import InfoRow from './header-components/InfoRow';
import TrackHighlights from './TrackHighlights';

const tabStyle = (active: boolean) => ({
  cursor: active ? 'default' : 'pointer',
  fontFamily: 'TT Commons',
  fontSize: '1.625rem',
  minHeight: '45px',
  padding: 0,
  paddingX: '8px',
  textTransform: 'none',
});

const sortOptions = [
  { label: 'Date Added', sortKey: 'added' },
  { label: 'Last Played', sortKey: 'played' },
  { label: 'Playcount', sortKey: 'plays' },
  { label: 'Release Date', sortKey: 'date' },
  { label: 'Release Type', sortKey: 'type' },
  { label: 'Title', sortKey: 'title' },
];

interface SortMenuButtonProps extends MenuButtonProps{
  open: boolean;
  sort: { by: string, order: string }
}

const SortMenuButton = React.forwardRef((
  { open, sort, onClick, onKeyDown }: SortMenuButtonProps,
  ref,
) => (
  <MenuButton
    className={styles['sort-button']}
    ref={ref}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <Box
      alignItems="center"
      color={open ? 'text.primary' : 'text.secondary'}
      display="flex"
      height={32}
      justifyContent="space-between"
      sx={{
        '&:hover': {
          color: 'text.primary',
        },
      }}
      width={160}
    >
      <Typography>
        {sortOptions.find((option) => option.sortKey === sort.by)!.label}
      </Typography>
      <SvgIcon>
        {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
      </SvgIcon>
    </Box>
  </MenuButton>
));

interface SortMenuItemProps {
  handleSort: (by: string) => void;
  label: string;
  sort: { by: string, order: string }
  sortKey: string;
}

const SortMenuItem = ({ handleSort, label, sort, sortKey }: SortMenuItemProps) => (
  <MenuItem
    onClick={() => handleSort(sortKey)}
  >
    <Box alignItems="center" display="flex" justifyContent="space-between" width={1}>
      {label}
      {sort.by === sortKey && (
        <SvgIcon sx={{ height: '0.8em', width: '0.8em' }}>
          {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
        </SvgIcon>
      )}
    </Box>
  </MenuItem>
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

export const thresholds = Array.from(Array(101).keys()).map((n) => n / 100);

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistContext }) => {
  const {
    artist: artistData, colors, filter, filters, library, navigate, setFilter, setSort, sort, width,
  } = context!;
  const { artist } = artistData!;
  const menuStyle = useMenuStyle();
  const tracksInView = useInView({ threshold: 0 });
  const [tab, setTab] = useState(0);

  const handleSort = (by: string) => {
    if (sort.by === by) {
      setSort({ ...sort, order: sort.order === 'asc' ? 'desc' : 'asc' });
      return;
    }
    setSort({ ...sort, by });
  };

  if (!context) {
    return null;
  }

  return (
    <>
      <Banner
        context={context}
        tracksInView={tracksInView}
      />
      <Box
        display="flex"
        flexWrap="wrap"
        mt="9px"
        mx="auto"
        ref={tracksInView.ref}
        width={(width * 0.89)}
      >
        <InfoRow
          artistData={artistData}
          colors={colors}
          library={library}
          navigate={navigate}
          width={width}
        />
        <span style={{ height: 24, width: '100%' }} />
        <Box
          color="text.primary"
          display="flex"
          flex="50000 0 410px"
          flexDirection="column"
          minHeight={
            (Math.max(context!.topTracks!.length, context!.recentFavorites!.length) * 56) + 45
          }
          sx={{
            transform: 'translateZ(0px)',
          }}
        >
          {tab === 0 && (
            <Typography
              fontFamily="TT Commons"
              fontSize="0.9rem"
              position="absolute"
              sx={{
                bottom: -36,
                color: 'text.secondary',
                left: 6,
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
                to={`/artists/${artist.id}/tracks`}
              >
                See more
              </Link>
            </Typography>
          )}
          <Tabs
            TabIndicatorProps={{ sx: { height: 0 } }}
            sx={{
              minHeight: '45px',
            }}
            textColor="inherit"
            value={tab}
            onChange={(e, newValue) => setTab(newValue)}
          >
            <Tab disableRipple label="Top Tracks" sx={tabStyle(tab === 0)} />
            {context!.recentFavorites!.length > 0 && (
              <Tab disableRipple label="Recent Favorites" sx={tabStyle(tab === 1)} />
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
        </Box>
        <Highlights
          artistData={artistData}
          height={context!.topTracks!.length * 56}
          library={library}
          navigate={navigate}
          width={width}
        />
      </Box>
      <Box
        alignItems="flex-end"
        display="flex"
        justifyContent="space-between"
        mx="auto"
        pt="56px"
        width={(width * 0.89)}
      >
        <Typography
          color="text.primary"
          fontFamily="TT Commons"
          fontSize="1.625rem"
          pt="6px"
        >
          Discography
        </Typography>
        <Menu
          transition
          align="end"
          menuButton={({ open }) => <SortMenuButton open={open} sort={sort} />}
          menuStyle={menuStyle}
        >
          {sortOptions.map((option) => (
            <SortMenuItem
              handleSort={handleSort}
              key={option.sortKey}
              label={option.label}
              sort={sort}
              sortKey={option.sortKey}
            />
          ))}
        </Menu>
      </Box>
      <Box
        alignItems="center"
        display="flex"
        flexWrap="wrap"
        gap="8px"
        mx="auto"
        my="12px"
        width={(width * 0.89)}
      >
        {filters.map((group) => (
          <Chip
            color={filter === group ? 'primary' : 'default'}
            key={group}
            label={group}
            sx={{ fontSize: '0.9rem' }}
            onClick={() => setFilter(group)}
          />
        ))}
      </Box>
    </>
  );
};

export default React.memo(Header);
