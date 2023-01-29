import { Avatar, Box, Fade, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import React from 'react';
import {
  BiHash,
  HiArrowSmDown,
  HiArrowSmUp,
  IoMdMicrophone,
  RiHeartLine,
  RiTimeLine,
} from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { NavLink } from 'react-router-dom';
import FilterInput from 'components/filter-input/FilterInput';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail } from 'hooks/plexHooks';
import { PlexSortKeys } from 'types/enums';
import { ArtistTracksContext } from './ArtistTracks';
import FixedHeader from './FixedHeader';

const sortOptions = [
  { label: 'Album', sortKey: PlexSortKeys.ALBUM_TITLE },
  { label: 'Artist', sortKey: PlexSortKeys.ARTIST_TITLE },
  { label: 'Date Added', sortKey: PlexSortKeys.ADDED_AT },
  { label: 'Duration', sortKey: PlexSortKeys.DURATION },
  { label: 'Last Played', sortKey: PlexSortKeys.LAST_PLAYED },
  { label: 'Playcount', sortKey: PlexSortKeys.PLAYCOUNT },
  { label: 'Popularity', sortKey: PlexSortKeys.POPULARITY },
  { label: 'Rating', sortKey: PlexSortKeys.RATING },
  { label: 'Release Date', sortKey: PlexSortKeys.RELEASE_DATE },
  { label: 'Title', sortKey: PlexSortKeys.TRACK_TITLE },
];

interface SortMenuButtonProps extends MenuButtonProps{
  open: boolean;
  sort: string;
}

const SortMenuButton = React.forwardRef((
  { open, sort, onClick, onKeyDown }: SortMenuButtonProps,
  ref,
) => {
  const [by, order] = sort.split(':');
  return (
    <MenuButton
      className="sort"
      ref={ref}
      onClick={onClick}
      onKeyDown={onKeyDown}
    >
      <Box
        alignItems="center"
        borderRadius="4px"
        color={open ? 'text.primary' : 'text.secondary'}
        display="flex"
        height={32}
        justifyContent="space-between"
        paddingX="2px"
        sx={{
          '&:hover': {
            color: 'text.primary',
          },
        }}
        width={160}
      >
        <Typography ml="6px">
          {sortOptions.find((option) => option.sortKey === by)!.label}
        </Typography>
        <SvgIcon style={{ marginRight: '2px' }}>
          {(order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
        </SvgIcon>
      </Box>
    </MenuButton>
  );
});

interface SortMenuItemProps {
  handleSort: (sortKey: string) => void
  label: string;
  sort: string;
  sortKey: string;
}

const SortMenuItem = ({ handleSort, label, sort, sortKey }: SortMenuItemProps) => {
  const [by, order] = sort.split(':');
  return (
    <MenuItem
      onClick={() => handleSort(sortKey)}
    >
      <Box alignItems="center" display="flex" justifyContent="space-between" width={1}>
        {label}
        {by === sortKey && (
          <SvgIcon sx={{ height: '0.8em', width: '0.8em' }}>
            {(order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
          </SvgIcon>
        )}
      </Box>
    </MenuItem>
  );
};

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistTracksContext }) => {
  const {
    artist: artistData, filter, items, playTracks, setFilter, setSort, sort,
  } = context!;
  const { artist } = artistData!;
  const [thumbSrcSm] = useThumbnail(artist.thumb || 'none', 100);
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const handlePlay = () => playTracks(items);
  const handleShuffle = () => playTracks(items, true);

  const handleSort = (sortKey: string) => {
    const [by, order] = sort.split(':');
    if (by === sortKey) {
      const newOrder = (order === 'asc' ? 'desc' : 'asc');
      setSort([by, newOrder].join(':'));
      return;
    }
    setSort([sortKey, order].join(':'));
  };

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
            artist={artist}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box
        maxWidth="900px"
        mx="auto"
        ref={ref}
        width="89%"
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
            alt={artist.title}
            src={artist.thumb ? thumbSrcSm : ''}
            sx={{ width: 60, height: 60 }}
          >
            <SvgIcon
              className="generic-artist"
              sx={{ alignSelf: 'center', color: 'common.black', height: '65%', width: '65%' }}
            >
              <IoMdMicrophone />
            </SvgIcon>
          </Avatar>
          <Typography
            alignSelf="center"
            fontFamily="TT Commons"
            fontSize="1.75rem"
            fontWeight={600}
            ml="10px"
            variant="h5"
            width={1}
          >
            <NavLink
              className="link"
              state={{ guid: artist.guid, title: artist.title }}
              to={`/artists/${artist.id}`}
            >
              {artist.title}
            </NavLink>
            &nbsp;&nbsp;»&nbsp;&nbsp;All Tracks
          </Typography>
          <PlayShuffleButton
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
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
              justifyContent: 'space-between',
            }}
          >
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
            <FilterInput filter={filter} setFilter={setFilter} />
          </Box>
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
