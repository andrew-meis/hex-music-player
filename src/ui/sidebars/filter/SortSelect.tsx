import { InputAdornment, MenuItem, SvgIcon } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { HiArrowSmUp, HiArrowSmDown, TbArrowsSort } from 'react-icons/all';
import { PlexSort, plexSort } from 'classes/index';
import Select from 'components/select/Select';
import { AlbumSortKeys, ArtistSortKeys, QueryKeys, SortOrders, TrackSortKeys } from 'types/enums';

const albumSortOptions = [
  { value: 'addedAt', label: 'Date Added' },
  { value: 'artist.titleSort', label: 'Artist' },
  { value: 'lastViewedAt', label: 'Last Played' },
  { value: 'viewCount', label: 'Playcount' },
  { value: 'random', label: 'Random' },
  { value: 'originallyAvailableAt', label: 'Release Date' },
  { value: 'titleSort', label: 'Title' },
  { value: 'year', label: 'Year' },
];

const artistSortOptions = [
  { value: 'addedAt', label: 'Date Added' },
  { value: 'lastViewedAt', label: 'Last Played' },
  { value: 'viewCount', label: 'Playcount' },
  { value: 'random', label: 'Random' },
  { value: 'titleSort', label: 'Title' },
];

const trackSortOptions = [
  { value: 'album.titleSort', label: 'Album' },
  { value: 'artist.titleSort', label: 'Artist' },
  { value: 'addedAt', label: 'Date Added' },
  { value: 'duration', label: 'Duration' },
  { value: 'lastViewedAt', label: 'Last Played' },
  { value: 'lastRatedAt', label: 'Last Rated' },
  { value: 'viewCount', label: 'Playcount' },
  { value: 'ratingCount', label: 'Popularity' },
  { value: 'random', label: 'Random' },
  { value: 'album.originallyAvailableAt', label: 'Release Date' },
  { value: 'titleSort', label: 'Title' },
  { value: 'album.year', label: 'Year' },
];

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

  const handleSelect = (e: any) => {
    const sortKey = e.target.getAttribute('data-value');
    if (sort.by === sortKey) {
      const newSort = sort.reverseOrder();
      setSort(newSort);
      return;
    }
    const newSort = sort.setBy(sortKey);
    setSort(newSort);
  };

  return (
    <Select
      fullWidth
      startAdornment={(
        <InputAdornment position="start">
          <TbArrowsSort viewBox="0 0 22 22" />
        </InputAdornment>
      )}
      sx={{
        width: '100%',
        '& .MuiInputBase-input > svg': {
          display: 'none',
        },
      }}
      value={sort.by}
    >
      {pathname === '/albums' && albumSortOptions.map((option) => (
        <MenuItem
          key={option.value}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          value={option.value}
          onClick={handleSelect}
        >
          {option.label}
          {sort.by === option.value && option.value !== 'random' && (
            <SvgIcon viewBox="0 0 16 24">
              {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
            </SvgIcon>
          )}
        </MenuItem>
      ))}
      {pathname === '/artists' && artistSortOptions.map((option) => (
        <MenuItem
          key={option.value}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          value={option.value}
          onClick={handleSelect}
        >
          {option.label}
          {sort.by === option.value && option.value !== 'random' && (
            <SvgIcon viewBox="0 0 16 24">
              {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
            </SvgIcon>
          )}
        </MenuItem>
      ))}
      {pathname === '/tracks' && trackSortOptions.map((option) => (
        <MenuItem
          key={option.value}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
          }}
          value={option.value}
          onClick={handleSelect}
        >
          {option.label}
          {sort.by === option.value && option.value !== 'random' && (
            <SvgIcon viewBox="0 0 16 24">
              {(sort.order === 'asc' ? <HiArrowSmUp /> : <HiArrowSmDown />)}
            </SvgIcon>
          )}
        </MenuItem>
      ))}
    </Select>
  );
};

export default SortSelect;
