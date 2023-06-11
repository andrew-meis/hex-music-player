import { Box, Chip, ClickAwayListener, SvgIcon } from '@mui/material';
import React, { useMemo, useState } from 'react';
import { BiChevronRight, HiArrowSmDown, HiArrowSmUp } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { Artist } from 'api/index';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import SelectChips from 'components/select-chips/SelectChips';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import { PlexSortKeys, SortOrders } from 'types/enums';
import { Sort } from 'types/interfaces';
import { ArtistContext } from './Artist';
import Banner from './header-components/Banner';
import InfoRow from './header-components/InfoRow';
import SimilarArtistsCards from './header-components/SimilarArtistsCards';
import TrackTabs from './header-components/TrackTabs';

const sortOptions = [
  { label: 'Date Added', sortKey: 'addedAt' },
  { label: 'Last Played', sortKey: 'lastViewedAt' },
  { label: 'Playcount', sortKey: 'viewCount' },
  { label: 'Release Date', sortKey: 'originallyAvailableAt' },
  { label: 'Release Type', sortKey: 'section' },
  { label: 'Title', sortKey: 'title' },
] as { label: string, sortKey: Sort['by']}[];

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
    playSwitch,
    refreshMetadata,
    setFilter,
    setSort,
    sort,
    width,
  } = context!;
  const { artist } = artistData!;

  const maxWidth = 1600;
  const tooltipMaxWidth = Math.min(maxWidth - 12, width - VIEW_PADDING - 12);

  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const prevIndex = usePrevious(activeIndex);
  const tracksInView = useInView({ threshold: 0 });
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);
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
    array = [...new Map(array.map((item) => [item.id, item])).values()]
      .slice(0, colLength * 5);
    return array as Artist[];
  }, [artistData, colLength]);

  const handleSort = (by: Sort['by']) => {
    setOpen(false);
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
          playSwitch={playSwitch}
          refreshMetadata={refreshMetadata}
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
          fontFamily="TT Commons, sans-serif"
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
      </Box>
      <Box
        alignItems="center"
        display="flex"
        justifyContent="space-between"
        mx="auto"
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          display="flex"
          flexWrap="wrap"
          gap="8px"
          my="12px"
        >
          <SelectChips
            bgleft="linear-gradient(to right, var(--mui-palette-background-paper), transparent)"
            bgright="linear-gradient(to left, var(--mui-palette-background-paper), transparent)"
            maxWidth={tooltipMaxWidth - 160}
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
          </SelectChips>
        </Box>
        <Box
          display="flex"
          flexShrink={0}
          height={32}
          justifyContent="flex-end"
          width={160}
        >
          <SelectTooltip
            maxWidth={tooltipMaxWidth}
            open={open}
            placement="bottom-end"
            title={(
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <SelectChips leftScroll maxWidth={tooltipMaxWidth}>
                  {sortOptions.map((option) => {
                    if (sort.by === option.sortKey) return null;
                    return (
                      <Chip
                        color="default"
                        key={option.sortKey}
                        label={(
                          <Box alignItems="center" display="flex">
                            {option.label}
                            {sort.by === option.sortKey && (
                              <SvgIcon viewBox="0 0 16 24">
                                {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
                              </SvgIcon>
                            )}
                          </Box>
                        )}
                        sx={{ fontSize: '0.9rem' }}
                        onClick={() => handleSort(option.sortKey)}
                      />
                    );
                  })}
                  <Box bgcolor="border.main" flexShrink={0} height={32} width="1px" />
                  {sortOptions.map((option) => {
                    if (sort.by === option.sortKey) {
                      return (
                        <Chip
                          color="default"
                          key={option.sortKey}
                          label={(
                            <Box alignItems="center" display="flex">
                              {option.label}
                              {sort.by === option.sortKey && (
                                <SvgIcon viewBox="0 0 16 24">
                                  {(sort.order === 'asc'
                                    ? <HiArrowSmUp />
                                    : <HiArrowSmDown />
                                  )}
                                </SvgIcon>
                              )}
                            </Box>
                          )}
                          sx={{ fontSize: '0.9rem' }}
                          onClick={() => handleSort(option.sortKey)}
                        />
                      );
                    }
                    return null;
                  })}
                </SelectChips>
              </ClickAwayListener>
            )}
          >
            <Chip
              color="primary"
              label={(
                <Box alignItems="center" display="flex">
                  {sortOptions.find((option) => option.sortKey === sort.by)?.label}
                  <SvgIcon viewBox="0 0 16 24">
                    {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
                  </SvgIcon>
                </Box>
              )}
              sx={{ fontSize: '0.9rem' }}
              onClick={() => setOpen(true)}
            />
          </SelectTooltip>
        </Box>
      </Box>
    </>
  );
};

export default React.memo(Header);
