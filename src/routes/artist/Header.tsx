import { Box, Chip, ClickAwayListener, SvgIcon } from '@mui/material';
import React, { useMemo, useRef, useState } from 'react';
import { BiChevronRight } from 'react-icons/bi';
import { HiArrowSmUp, HiArrowSmDown } from 'react-icons/hi';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { usePrevious } from 'react-use';
import { Artist } from 'api/index';
import { ChipSelect } from 'components/chips';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import { HexSortKeys, SortOrders, TrackSortKeys } from 'types/enums';
import { AlbumWithSection } from 'types/interfaces';
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
] as { label: string, sortKey: HexSortKeys}[];

export const thresholds = Array.from(Array(101).keys()).map((n) => n / 100);

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

  const [activeIndex, setActiveIndex] = useState(0);
  const [open, setOpen] = useState(false);
  const chipRef = useRef<HTMLDivElement | null>(null);
  const prevIndex = usePrevious(activeIndex);
  const tracksInView = useInView({ threshold: 0 });
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);
  const colLength = (cols - 1) * 2;

  const maxWidth = 1600;
  const albumFiltersMaxWidth = Math.min(maxWidth, width - VIEW_PADDING) - 12 - 160;
  const tooltipMaxWidth = Math.min(maxWidth, width - VIEW_PADDING)
    - 20 // x-padding + tooltip offset
    - (chipRef.current?.clientWidth || 0);

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

  const handleSort = (sortKey: keyof AlbumWithSection) => {
    setOpen(false);
    if (sort.by === sortKey) {
      const newSort = sort.reverseOrder();
      setSort(newSort);
      return;
    }
    const newSort = sort.setBy(sortKey);
    setSort(newSort);
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
        mt="8px"
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
              sort: [TrackSortKeys.RELEASE_DATE, SortOrders.DESC],
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
          <ChipSelect
            bgleft="linear-gradient(to right, var(--mui-palette-background-paper), transparent)"
            bgright="linear-gradient(to left, var(--mui-palette-background-paper), transparent)"
            maxWidth={albumFiltersMaxWidth}
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
          </ChipSelect>
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
            placement="left"
            title={(
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <ChipSelect leftScroll maxWidth={tooltipMaxWidth}>
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
                </ChipSelect>
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
              ref={chipRef}
              sx={{ fontSize: '0.9rem' }}
              onClick={() => setOpen(true)}
            />
          </SelectTooltip>
        </Box>
      </Box>
    </>
  );
};

Header.defaultProps = {
  context: undefined,
};

export default React.memo(Header);
