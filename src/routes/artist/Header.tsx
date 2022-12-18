import { Box, Chip, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import { Artist } from 'hex-plex';
import React, { useMemo } from 'react';
import { BiChevronRight, HiArrowSmDown, HiArrowSmUp } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import useMenuStyle from 'hooks/useMenuStyle';
import styles from 'styles/ArtistHeader.module.scss';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import InfoRow from './header-components/InfoRow';
import SimilarArtistAvatarGroup from './header-components/SimilarArtistAvatarGroup';
import TrackTabs from './header-components/TrackTabs';

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

export const thresholds = Array.from(Array(101).keys()).map((n) => n / 100);

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistContext }) => {
  const {
    artist: artistData,
    colors,
    filter,
    filters,
    library,
    navigate,
    refreshMetadata,
    refreshPage,
    setFilter,
    setSort,
    sort,
    width,
  } = context!;
  const { artist } = artistData!;
  const maxList = Math.max(context!.topTracks!.length, context!.recentFavorites!.length);
  const menuStyle = useMenuStyle();
  const tracksInView = useInView({ threshold: 0 });
  const similarArtists = useMemo(() => {
    const similar = artistData?.hubs.find((hub) => hub.hubIdentifier === 'artist.similar');
    const sonicSimilar = artistData?.hubs
      .find((hub) => hub.hubIdentifier === 'external.artist.similar.sonically');
    let array = [];
    if (similar && similar.items.length > 0) {
      array.push(...similar.items);
    }
    if (sonicSimilar && sonicSimilar.items.length > 0) {
      array.push(...sonicSimilar.items);
    }
    array = [...new Map(array.map((item) => [item.id, item])).values()];
    return array as Artist[];
  }, [artistData]);

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
          refreshMetadata={refreshMetadata}
          refreshPage={refreshPage}
        />
        <Box sx={{ height: 24, width: '100%' }} />
        <TrackTabs
          artist={artist}
          context={context}
          maxList={maxList}
        />
      </Box>
      <Box sx={{ height: 24, width: '100%' }} />
      {similarArtists.length > 0 && (
        <SimilarArtistAvatarGroup
          artist={artist}
          library={library}
          navigate={navigate}
          similarArtists={similarArtists}
          width={width}
        />
      )}
      <Box sx={{ height: 24, width: '100%' }} />
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
        >
          Discography&nbsp;&nbsp;&nbsp;
          <SvgIcon style={{ position: 'relative', left: -18, top: 6 }}>
            <BiChevronRight />
          </SvgIcon>
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
