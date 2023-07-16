import { Box, Chip, MenuItem, SvgIcon, Typography } from '@mui/material';
import { useAtom } from 'jotai';
import React from 'react';
import { CgArrowLongDown } from 'react-icons/cg';
import { Album, Artist, Track } from 'api/index';
import Select from 'components/select/Select';
import { albumSortingAtom } from 'routes/albums/Albums';
import { artistSortingAtom } from 'routes/artists/Artists';
import { trackSortingAtom } from 'routes/tracks/Tracks';

const albumSortOptions: {
  value: keyof Album | 'random',
  label: string,
  type: 'alpha' | 'date' | 'number',
}[] = [
  { value: 'addedAt', label: 'Date Added', type: 'date' },
  { value: 'parentTitle', label: 'Artist', type: 'alpha' },
  { value: 'lastViewedAt', label: 'Last Played', type: 'date' },
  { value: 'viewCount', label: 'Playcount', type: 'number' },
  { value: 'random', label: 'Random', type: 'alpha' },
  { value: 'originallyAvailableAt', label: 'Release Date', type: 'date' },
  { value: 'title', label: 'Title', type: 'alpha' },
  { value: 'year', label: 'Year', type: 'date' },
];

const artistSortOptions: {
  value: keyof Artist | 'random',
  label: string,
  type: 'alpha' | 'date' | 'number',
}[] = [
  { value: 'addedAt', label: 'Date Added', type: 'date' },
  { value: 'lastViewedAt', label: 'Last Played', type: 'date' },
  { value: 'viewCount', label: 'Playcount', type: 'number' },
  { value: 'random', label: 'Random', type: 'alpha' },
  { value: 'title', label: 'Title', type: 'alpha' },
];

const trackSortOptions: {
  value: keyof Track | 'random',
  label: string,
  type: 'alpha' | 'date' | 'number',
}[] = [
  { value: 'parentTitle', label: 'Album', type: 'alpha' },
  { value: 'grandparentTitle', label: 'Artist', type: 'alpha' },
  { value: 'addedAt', label: 'Date Added', type: 'date' },
  { value: 'duration', label: 'Duration', type: 'number' },
  { value: 'lastViewedAt', label: 'Last Played', type: 'date' },
  { value: 'lastRatedAt', label: 'Last Rated', type: 'date' },
  { value: 'viewCount', label: 'Playcount', type: 'number' },
  { value: 'ratingCount', label: 'Popularity', type: 'number' },
  { value: 'random', label: 'Random', type: 'alpha' },
  // { value: 'album.originallyAvailableAt', label: 'Release Date', type: 'date' },
  { value: 'title', label: 'Title', type: 'alpha' },
  { value: 'parentYear', label: 'Year', type: 'date' },
];

const sx = {
  fontFamily: 'Consolas, monospace',
  fontSize: '11px',
  lineHeight: '10px',
};

const SortOrderText: React.FC<{
  by: string;
  order: 'asc' | 'desc';
}> = ({ by, order }) => {
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

const InputSort = ({ pathname }: { pathname: string }) => {
  const trimmed = pathname.substring(1, pathname.length - 1) as 'album' | 'artist' | 'track';
  const [[sorting], setSorting] = useAtom((() => {
    switch (true) {
      case (trimmed === 'album'):
        return albumSortingAtom;
      case (trimmed === 'artist'):
        return artistSortingAtom;
      case (trimmed === 'track'):
        return trackSortingAtom;
      default:
        return trackSortingAtom;
    }
  })());

  const handleReverseSort = () => {
    const newSort = {
      desc: !sorting.desc,
      id: sorting.id,
    };
    setSorting([newSort]);
  };

  const handleSelect = (e: any) => {
    const sortKey = e.target.getAttribute('data-value');
    const newSort = {
      desc: sorting.desc,
      id: sortKey,
    };
    setSorting([newSort]);
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
        value={sorting.id}
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
        disabled={sorting.id === 'random'}
        label={!sorting.desc
          ? (
            <Box display="flex" mt="4px">
              <SvgIcon viewBox="0 4 24 24">
                <CgArrowLongDown />
              </SvgIcon>
              <SortOrderText by={sorting.id} order={sorting.desc ? 'desc' : 'asc'} />
            </Box>
          )
          : (
            <Box display="flex" mt="4px">
              <SvgIcon viewBox="0 4 24 24">
                <CgArrowLongDown />
              </SvgIcon>
              <SortOrderText by={sorting.id} order={sorting.desc ? 'desc' : 'asc'} />
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

export default InputSort;
