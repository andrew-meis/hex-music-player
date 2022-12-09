import { Box, Chip, SvgIcon, Theme, Typography, useTheme } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import React from 'react';
import { TiArrowSortedDown, TiArrowSortedUp, TiArrowUnsorted } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import useMenuStyle from 'hooks/useMenuStyle';
import styles from 'styles/ArtistHeader.module.scss';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import Highlights from './header-components/Highlights';
import InfoRow from './header-components/InfoRow';
import TopTracks from './TopTracks';

interface SortMenuButtonProps extends MenuButtonProps{
  open: boolean;
  theme: Theme;
}

const SortMenuButton = React.forwardRef((
  { open, theme, onClick, onKeyDown }: SortMenuButtonProps,
  ref,
) => (
  <MenuButton
    className={styles['sort-button']}
    ref={ref}
    style={{
      '--color': theme.palette.getContrastText(theme.palette.background.default),
      '--hover': theme.palette.action.selected,
    } as React.CSSProperties}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <SvgIcon sx={{ color: open ? 'action.selected' : 'text.primary' }}><TiArrowUnsorted /></SvgIcon>
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
          {(sort.order === 'asc' ? <TiArrowSortedUp /> : <TiArrowSortedDown />)}
        </SvgIcon>
      )}
    </Box>
  </MenuItem>
);

export const thresholds = Array.from(Array(101).keys()).map((n) => n / 100);

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistContext }) => {
  const {
    artist: artistData, colors, filter, filters, library, navigate, setFilter, setSort, sort, width,
  } = context!;
  const menuStyle = useMenuStyle();
  const theme = useTheme();
  const tracksInView = useInView({ threshold: 0 });

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
        <TopTracks
          context={context}
          style={{ fontSize: '1.625rem', paddingTop: '6px' }}
          tracks={context!.topTracks}
        />
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
          menuButton={({ open }) => <SortMenuButton open={open} theme={theme} />}
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
