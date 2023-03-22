import { Box, Chip, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import { Artist } from 'hex-plex';
import React, { useMemo, useState } from 'react';
import { BiChevronRight, HiArrowSmDown, HiArrowSmUp } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import { WIDTH_CALC } from 'constants/measures';
import { PlexSortKeys, SortOrders } from 'types/enums';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import InfoRow from './header-components/InfoRow';
import SimilarArtistsCards from './header-components/SimilarArtistsCards';
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
    className="sort"
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
    cols,
    filter,
    filters,
    navigate,
    refreshMetadata,
    refreshPage,
    setFilter,
    setSort,
    sort,
    width,
  } = context!;
  const { artist } = artistData!;

  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const tracksInView = useInView({ threshold: 0 });
  const difference = prevIndex ? activeIndex - prevIndex : 1;
  const colLength = (cols - 1) * 2;

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
        width={WIDTH_CALC}
      >
        <InfoRow
          artistData={artistData}
          colors={colors}
          navigate={navigate}
          refreshMetadata={refreshMetadata}
          refreshPage={refreshPage}
          width={width}
        />
        <Box sx={{ height: 24, width: '100%' }} />
        <TrackTabs
          artist={artist}
          context={context}
        />
      </Box>
      {similarArtists.length > 0 && (
        <>
          <div style={{ height: 12, width: '100%' }} />
          <SimilarArtistsCards
            activeIndex={activeIndex}
            artist={artist}
            context={context}
            difference={difference}
            similarArtists={similarArtists}
          />
          <PaginationDots
            activeIndex={activeIndex}
            array={similarArtists}
            colLength={colLength}
            setActiveIndex={setActiveIndex}
          />
        </>
      )}
      <div style={{ height: 12, width: '100%' }} />
      <Box
        alignItems="flex-end"
        display="flex"
        justifyContent="space-between"
        mx="auto"
        width={WIDTH_CALC}
      >
        <MotionTypography
          color="text.primary"
          fontFamily="TT Commons"
          fontSize="1.625rem"
          marginRight="auto"
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
            to={`/artists/${artist.id}/discography`}
          >
            Discography
            <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
              <BiChevronRight />
            </MotionSvg>
          </Link>
        </MotionTypography>
        <Menu
          transition
          align="end"
          menuButton={({ open }) => <SortMenuButton open={open} sort={sort} />}
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
        width={WIDTH_CALC}
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
