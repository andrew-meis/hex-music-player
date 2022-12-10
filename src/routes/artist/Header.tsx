import { Box, Chip, SvgIcon, Tab, Tabs, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import React, { useState } from 'react';
import { HiArrowSmDown, HiArrowSmUp } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import useMenuStyle from 'hooks/useMenuStyle';
import styles from 'styles/ArtistHeader.module.scss';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import Highlights from './header-components/Highlights';
import InfoRow from './header-components/InfoRow';
import TopTracks from './TopTracks';

const getText = (by: string) => {
  if (by === 'added') {
    return 'Date Added';
  }
  if (by === 'date') {
    return 'Release Date';
  }
  if (by === 'played') {
    return 'Last Played';
  }
  if (by === 'plays') {
    return 'Playcount';
  }
  if (by === 'title') {
    return 'Title';
  }
  if (by === 'type') {
    return 'Release Type';
  }
  return '';
};

const tabStyle = (active: boolean) => ({
  cursor: active ? 'default' : 'pointer',
  fontFamily: 'TT Commons',
  fontSize: '1.625rem',
  minHeight: '45px',
  padding: 0,
  paddingX: '8px',
  textTransform: 'none',
});

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
        {getText(sort.by)}
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
        >
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
            <TopTracks
              context={context}
              tracks={context!.topTracks}
            />
          </TabPanel>
          <TabPanel index={1} value={tab}>
            <TopTracks
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
        pt="32px"
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
          <SortMenuItem
            handleSort={handleSort}
            label="Date Added"
            sort={sort}
            sortKey="added"
          />
          <SortMenuItem
            handleSort={handleSort}
            label="Last Played"
            sort={sort}
            sortKey="played"
          />
          <SortMenuItem
            handleSort={handleSort}
            label="Playcount"
            sort={sort}
            sortKey="plays"
          />
          <SortMenuItem
            handleSort={handleSort}
            label="Release Date"
            sort={sort}
            sortKey="date"
          />
          <SortMenuItem
            handleSort={handleSort}
            label="Release Type"
            sort={sort}
            sortKey="type"
          />
          <SortMenuItem
            handleSort={handleSort}
            label="Title"
            sort={sort}
            sortKey="title"
          />
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
            sx={{
              fontFamily: 'Arimo',
              fontSize: '0.9rem',
              transition: 'background 500ms ease-in, box-shadow 200ms ease-in',
              '&:hover': {
                boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)',
              },
            }}
            onClick={() => setFilter(group)}
          />
        ))}
      </Box>
    </>
  );
};

export default React.memo(Header);
