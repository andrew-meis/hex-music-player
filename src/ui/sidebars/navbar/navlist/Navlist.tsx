import { Box, ListItem, SvgIcon, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { capitalize } from 'lodash';
import React from 'react';
import { BiChevronLeft } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import { Virtuoso } from 'react-virtuoso';
import { Album, Artist } from 'api/index';
import {
  navlistBoxStyle,
  navlistActiveBox,
  navlistTypeActiveStyle,
  navlistTypeStyle,
} from 'constants/style';
import { useConfig, useLibrary } from 'queries/app-queries';
import { MediaTag, filterOptionsQueryFn } from 'queries/library-query-fns';
import { isAlbum, isArtist, isGenre } from 'types/type-guards';

export interface ItemProps {
  item: Artist | Album | MediaTag;
}

const getLinkState = (item: ItemProps['item']) => {
  if (isArtist(item)) return { guid: item.guid, title: item.title };
  if (isAlbum(item)) return {};
  if (isGenre(item)) return { title: item.title };
  return {};
};

const getLinkTo = (item: ItemProps['item']) => {
  if (isArtist(item)) return `/artists/${item.id}`;
  if (isAlbum(item)) return `/albums/${item.id}`;
  if (isGenre(item)) return `/genres/${item.id}`;
  return '/home';
};

const Item = ({ item }: ItemProps) => (
  <Box>
    <NavLink
      className="nav-link"
      state={getLinkState(item)}
      to={getLinkTo(item)}
    >
      {({ isActive }) => (
        <ListItem
          sx={{
            ...navlistBoxStyle,
            border: '1px solid transparent',
            borderRadius: '4px',
            height: 33,
          }}
        >
          <Box sx={navlistActiveBox(isActive)} />
          <Typography sx={isActive ? navlistTypeActiveStyle : navlistTypeStyle}>
            {item.title}
          </Typography>
        </ListItem>
      )}
    </NavLink>
  </Box>
);

interface NavlistProps {
  list: string;
  setIndex: React.Dispatch<React.SetStateAction<number>>
}

const Navlist = ({ list, setIndex }: NavlistProps) => {
  const library = useLibrary();
  const { data: config } = useConfig();
  const { data: items, isLoading } = useQuery(
    [list],
    async () => {
      if (list === 'artists') return library.artists(config.sectionId!, { sort: 'titleSort:asc' });
      if (list === 'albums') return library.albums(config.sectionId!, { sort: 'titleSort:asc' });
      if (list === 'genres') {
        return filterOptionsQueryFn({
          config,
          field: 'genre',
          library,
          type: 9,
        });
      }
      return [];
    },
    {
      enabled: !!config && !!library && list !== '',
      refetchOnMount: true,
      refetchOnWindowFocus: false,
      select: (data) => {
        if ('artists' in data) return data.artists;
        if ('albums' in data) return data.albums;
        if (list === 'genres') return data;
        return [];
      },
    },
  );

  return (
    <>
      <Box
        alignItems="center"
        borderRadius="4px"
        color="text.primary"
        display="flex"
        justifyContent="space-between"
        paddingY="8px"
        width={1}
      >
        <SvgIcon
          sx={{
            mr: '5px',
            transition: 'transform 200ms ease-in-out',
            '&:hover': {
              color: 'primary.main',
              transform: 'scale(1.3)',
            },
          }}
          onClick={() => setIndex(0)}
        >
          <BiChevronLeft />
        </SvgIcon>
        <Typography fontSize="1.5rem" fontWeight={600} ml="4px">{capitalize(list)}</Typography>
      </Box>
      {!isLoading && items && items.length > 0 && (
        <Virtuoso
          className="scroll-container"
          fixedItemHeight={33}
          itemContent={(index) => Item({ item: items[index] })}
          style={{ height: 'calc(100% - 52px)' }}
          totalCount={items.length}
        />
      )}
      {!isLoading && items && items.length === 0 && (
        <Typography
          align="center"
          color="text.primary"
        >
          ...not yet implemented...
        </Typography>
      )}
    </>
  );
};

export default React.memo(Navlist);
