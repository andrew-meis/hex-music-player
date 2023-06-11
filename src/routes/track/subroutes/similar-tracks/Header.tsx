import {
  Avatar,
  Box,
  Chip,
  ClickAwayListener,
  Fade,
  SvgIcon,
  Typography,
} from '@mui/material';
import { useState } from 'react';
import {
  BiHash,
  HiArrowSmDown,
  HiArrowSmUp,
  IoMdMicrophone,
  RiHeartLine,
  RiTimeLine,
} from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { NavLink, useOutletContext } from 'react-router-dom';
import FilterChip from 'components/filter-chip/FilterChip';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import SelectChips from 'components/select-chips/SelectChips';
import SelectTooltip from 'components/tooltip/SelectTooltip';
import { VIEW_PADDING, WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import FixedHeader from './FixedHeader';
import { SimilarTracksContext } from './SimilarTracks';

const sortOptions = [
  { label: 'Album', sortKey: 'parentTitle' },
  { label: 'Artist', sortKey: 'grandparentTitle' },
  { label: 'Date Added', sortKey: 'addedAt' },
  { label: 'Duration', sortKey: 'duration' },
  { label: 'Last Played', sortKey: 'lastViewedAt' },
  { label: 'Last Rated', sortKey: 'lastRatedAt' },
  { label: 'Playcount', sortKey: 'viewCount' },
  { label: 'Popularity', sortKey: 'ratingCount' },
  { label: 'Rating', sortKey: 'userRating' },
  { label: 'Similarity', sortKey: 'distance' },
  { label: 'Title', sortKey: 'title' },
  { label: 'Year', sortKey: 'parentYear' },
];

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: SimilarTracksContext }) => {
  const {
    currentTrack, filter, items, playTracks, setFilter, setSort, sort,
  } = context!;
  const track = currentTrack!;
  const [open, setOpen] = useState(false);
  const [thumbSrcSm] = useThumbnail(track.thumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });
  const { width } = useOutletContext() as { width: number };

  const maxWidth = 900;
  const tooltipMaxWidth = Math.min(maxWidth - 12, width - VIEW_PADDING - 12);

  const handleSort = (sortKey: string) => {
    setOpen(false);
    const [by, order] = sort.split(':');
    if (by === sortKey) {
      const newOrder = (order === 'asc' ? 'desc' : 'asc');
      setSort([by, newOrder].join(':'));
      return;
    }
    setSort([sortKey, order].join(':'));
  };

  const handlePlay = () => playTracks(items);
  const handleShuffle = () => playTracks(items, true);

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth="1600px"
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSrcSm}
            track={track}
          />
        </Box>
      </Fade>
      <Box
        maxWidth={maxWidth}
        mx="auto"
        ref={ref}
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          bgcolor="background.paper"
          color="text.primary"
          display="flex"
          height={70}
          marginX="auto"
          maxWidth="1600px"
          paddingX="6px"
        >
          <Avatar
            alt={track.title}
            src={track.thumb ? thumbSrcSm : ''}
            sx={{ width: 60, height: 60 }}
            variant="rounded"
          >
            <SvgIcon
              className="generic-icon"
              sx={{ color: 'common.black' }}
            >
              <IoMdMicrophone />
            </SvgIcon>
          </Avatar>
          <Typography
            alignSelf="center"
            ml="10px"
            variant="header"
            width={1}
          >
            <NavLink
              className="link"
              to={`/albums/${track.parentId}`}
            >
              {track.title}
            </NavLink>
            &nbsp;&nbsp;»&nbsp;&nbsp;Similar Tracks
          </Typography>
          <PlayShuffleButton
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
          />
        </Box>
        <Box
          alignItems="center"
          display="flex"
          height={72}
          justifyContent="space-between"
        >
          <SelectTooltip
            maxWidth={tooltipMaxWidth}
            open={open}
            placement="bottom-start"
            title={(
              <ClickAwayListener onClickAway={() => setOpen(false)}>
                <SelectChips maxWidth={tooltipMaxWidth}>
                  {sortOptions.map((option) => {
                    if (sort.split(':')[0] === option.sortKey) {
                      return (
                        <Chip
                          color="default"
                          key={option.sortKey}
                          label={(
                            <Box alignItems="center" display="flex">
                              {option.label}
                              {sort.split(':')[0] === option.sortKey && (
                                <SvgIcon viewBox="0 0 16 24">
                                  {(sort.split(':')[1] === 'asc'
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
                  <Box bgcolor="border.main" flexShrink={0} height={32} width="1px" />
                  {sortOptions.map((option) => {
                    if (sort.split(':')[0] === option.sortKey) return null;
                    return (
                      <Chip
                        color="default"
                        key={option.sortKey}
                        label={(
                          <Box alignItems="center" display="flex">
                            {option.label}
                            {sort.split(':')[0] === option.sortKey && (
                              <SvgIcon viewBox="0 0 16 24">
                                {(sort.split(':')[1] === 'asc'
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
                  })}
                </SelectChips>
              </ClickAwayListener>
            )}
          >
            <Chip
              color="primary"
              label={(
                <Box alignItems="center" display="flex">
                  {sortOptions.find((option) => option.sortKey === sort.split(':')[0])?.label}
                  <SvgIcon viewBox="0 0 16 24">
                    {(sort.split(':')[1] === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
                  </SvgIcon>
                </Box>
              )}
              sx={{ fontSize: '0.9rem' }}
              onClick={() => setOpen(true)}
            />
          </SelectTooltip>
          <FilterChip
            filter={filter}
            setFilter={setFilter}
          />
        </Box>
        <Box
          alignItems="flex-start"
          borderBottom="1px solid"
          borderColor="border.main"
          color="text.secondary"
          display="flex"
          height={30}
          width="100%"
        >
          <Box maxWidth="10px" width="10px" />
          <Box display="flex" flexShrink={0} justifyContent="center" width="40px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <BiHash />
            </SvgIcon>
          </Box>
          <Box sx={{ width: '56px' }} />
          <Box
            sx={{
              alignItems: 'center',
              width: '50%',
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          />
          <Box display="flex" flexShrink={0} justifyContent="flex-end" mx="5px" width="80px">
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiHeartLine />
            </SvgIcon>
          </Box>
          <Box sx={{
            width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
          }}
          >
            <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
              <RiTimeLine />
            </SvgIcon>
          </Box>
          <Box maxWidth="10px" width="10px" />
        </Box>
      </Box>
    </>
  );
};

export default Header;
