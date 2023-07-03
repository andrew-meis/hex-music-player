import { Box, Chip, MenuItem, SvgIcon, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { CgArrowLongDown } from 'react-icons/cg';
import { PlexSort, plexSort } from 'classes';
import Select from 'components/select/Select';
import { AlbumSortKeys, ArtistSortKeys, QueryKeys, SortOrders, TrackSortKeys } from 'types/enums';

const albumSortOptions = [
  { value: 'addedAt', label: 'Date Added', type: 'date' },
  { value: 'artist.titleSort', label: 'Artist', type: 'alpha' },
  { value: 'lastViewedAt', label: 'Last Played', type: 'date' },
  { value: 'viewCount', label: 'Playcount', type: 'number' },
  { value: 'random', label: 'Random', type: 'alpha' },
  { value: 'originallyAvailableAt', label: 'Release Date', type: 'date' },
  { value: 'titleSort', label: 'Title', type: 'alpha' },
  { value: 'year', label: 'Year', type: 'date' },
];

const artistSortOptions = [
  { value: 'addedAt', label: 'Date Added', type: 'date' },
  { value: 'lastViewedAt', label: 'Last Played', type: 'date' },
  { value: 'viewCount', label: 'Playcount', type: 'number' },
  { value: 'random', label: 'Random', type: 'alpha' },
  { value: 'titleSort', label: 'Title', type: 'alpha' },
];

const trackSortOptions = [
  { value: 'album.titleSort', label: 'Album', type: 'alpha' },
  { value: 'artist.titleSort', label: 'Artist', type: 'alpha' },
  { value: 'addedAt', label: 'Date Added', type: 'date' },
  { value: 'duration', label: 'Duration', type: 'number' },
  { value: 'lastViewedAt', label: 'Last Played', type: 'date' },
  { value: 'lastRatedAt', label: 'Last Rated', type: 'date' },
  { value: 'viewCount', label: 'Playcount', type: 'number' },
  { value: 'ratingCount', label: 'Popularity', type: 'number' },
  { value: 'random', label: 'Random', type: 'alpha' },
  { value: 'album.originallyAvailableAt', label: 'Release Date', type: 'date' },
  { value: 'titleSort', label: 'Title', type: 'alpha' },
  { value: 'album.year', label: 'Year', type: 'date' },
];

const sx = {
  fontFamily: 'Consolas, monospace',
  fontSize: '11px',
  lineHeight: '10px',
};

interface SortOrderTextProps {
  by: string;
  order: 'asc' | 'desc';
}

const SortOrderText = ({ by, order }: SortOrderTextProps) => {
  const allSortOptions = [...albumSortOptions, ...artistSortOptions, ...trackSortOptions];
  const { type } = allSortOptions.find((opt) => opt.value === by)!;

  if (type === 'alpha' && order === 'asc') {
    return (
      <Box height={24} left={-4} position="relative">
        <Typography sx={sx}>A</Typography>
        <Typography sx={sx}>Z</Typography>
      </Box>
    );
  }

  if (type === 'alpha' && order === 'desc') {
    return (
      <Box height={24} left={-4} position="relative">
        <Typography sx={sx}>Z</Typography>
        <Typography sx={sx}>A</Typography>
      </Box>
    );
  }

  if (type === 'number' && order === 'asc') {
    return (
      <Box height={24} left={-4} position="relative">
        <Typography sx={sx}>1</Typography>
        <Typography sx={sx}>9</Typography>
      </Box>
    );
  }

  if (type === 'number' && order === 'desc') {
    return (
      <Box height={24} left={-4} position="relative">
        <Typography sx={sx}>9</Typography>
        <Typography sx={sx}>1</Typography>
      </Box>
    );
  }

  if (type === 'date' && order === 'asc') {
    return (
      <Box height={24} left={-4} position="relative">
        <Typography sx={sx}>OLD</Typography>
        <Typography sx={sx}>NEW</Typography>
      </Box>
    );
  }

  return (
    <Box height={24} left={-4} position="relative">
      <Typography sx={sx}>NEW</Typography>
      <Typography sx={sx}>OLD</Typography>
    </Box>
  );
};

const defaultSorts = {
  album: plexSort(AlbumSortKeys.ARTIST_TITLE, SortOrders.ASC),
  artist: plexSort(ArtistSortKeys.TITLE, SortOrders.ASC),
  track: plexSort(TrackSortKeys.ARTIST_TITLE, SortOrders.ASC),
};

const SortSelect = ({ pathname }: { pathname: string }) => {
  const queryClient = useQueryClient();
  const trimmed = pathname.substring(1, pathname.length - 1) as 'album' | 'artist' | 'track';
  const [sort, setSort] = useState(defaultSorts[trimmed]);

  useEffect(() => {
    if (pathname === '/albums') {
      const newSort = queryClient.getQueryData([QueryKeys.SORT_ALBUMS]) as PlexSort;
      setSort(newSort || defaultSorts.album);
      return;
    }
    if (pathname === '/artists') {
      const newSort = queryClient.getQueryData([QueryKeys.SORT_ARTISTS]) as PlexSort;
      setSort(newSort || defaultSorts.artist);
      return;
    }
    if (pathname === '/tracks') {
      const newSort = queryClient.getQueryData([QueryKeys.SORT_TRACKS]) as PlexSort;
      setSort(newSort || defaultSorts.track);
    }
  }, [pathname, queryClient]);

  useEffect(() => {
    if (!sort) return;
    if (pathname === '/albums') {
      queryClient.setQueryData([QueryKeys.SORT_ALBUMS], sort);
    }
    if (pathname === '/artists') {
      queryClient.setQueryData([QueryKeys.SORT_ARTISTS], sort);
    }
    if (pathname === '/tracks') {
      queryClient.setQueryData([QueryKeys.SORT_TRACKS], sort);
    }
  }, [sort, queryClient, pathname]);

  const handleReverseSort = () => {
    const newSort = sort.reverseOrder();
    setSort(newSort);
  };

  const handleSelect = (e: any) => {
    const sortKey = e.target.getAttribute('data-value');
    const newSort = sort.setBy(sortKey);
    setSort(newSort);
  };

  return (
    <Box display="flex" gap="4px">
      <Select
        fullWidth
        sx={{
          transition: 'background-color 300ms cubic-bezier(0.4, 0, 0.2, 1) 0ms',
          width: '100%',
          '&:hover': {
            borderRadius: '4px',
            backgroundColor: 'action.hover',
          },
        }}
        value={sort.by}
      >
        {pathname === '/albums' && albumSortOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            onClick={handleSelect}
          >
            {option.label}
          </MenuItem>
        ))}
        {pathname === '/artists' && artistSortOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            onClick={handleSelect}
          >
            {option.label}
          </MenuItem>
        ))}
        {pathname === '/tracks' && trackSortOptions.map((option) => (
          <MenuItem
            key={option.value}
            value={option.value}
            onClick={handleSelect}
          >
            {option.label}
          </MenuItem>
        ))}
      </Select>
      <Chip
        disabled={sort.by === 'random'}
        label={sort.order === 'asc'
          ? (
            <Box display="flex" mt="4px">
              <SvgIcon viewBox="0 4 24 24">
                <CgArrowLongDown />
              </SvgIcon>
              <SortOrderText by={sort.by} order={sort.order} />
            </Box>
          )
          : (
            <Box display="flex" mt="4px">
              <SvgIcon viewBox="0 4 24 24">
                <CgArrowLongDown />
              </SvgIcon>
              <SortOrderText by={sort.by} order={sort.order} />
            </Box>
          )}
        sx={{
          borderRadius: '4px',
          fontSize: '1rem',
          minWidth: 48,
          paddingLeft: 0,
          paddingRight: 0,
          '& .MuiChip-label': {
            padding: 0,
            paddingRight: 0.5,
          },
        }}
        onClick={handleReverseSort}
      />
    </Box>
  );
};

export default SortSelect;
