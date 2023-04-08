/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { SvgIcon } from '@mui/material';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React, { useState } from 'react';
import { BsDot, BsStarFill } from 'react-icons/all';
import { Library } from 'api/index';
import { QueryKeys } from 'types/enums';

const invalidateTrackQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries([QueryKeys.ALBUM_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_APPEARANCES]);
  await queryClient.invalidateQueries([QueryKeys.PLAYLIST_ITEMS]);
  await queryClient.invalidateQueries([QueryKeys.PLAYQUEUE]);
  await queryClient.invalidateQueries([QueryKeys.TOP]);
  await queryClient.invalidateQueries([QueryKeys.TRACK]);
};

interface RatingProps {
  id: number;
  library: Library;
  userRating: number;
}

const Rating = ({ id, library, userRating }: RatingProps) => {
  const queryClient = useQueryClient();
  const [hover, setHover] = useState(0);

  const handleClick = async (e: React.MouseEvent, value: number) => {
    e.stopPropagation();
    if (value === userRating) {
      await library.rate(id, -1);
      await invalidateTrackQueries(queryClient);
      return;
    }
    await library.rate(id, value * 2);
    await invalidateTrackQueries(queryClient);
  };

  const handleMouseEnter = (value: number) => {
    setHover(value);
  };

  const handleMouseLeave = () => {
    setHover(0);
  };

  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        maxHeight: 20,
        maxWidth: 75,
        minHeight: 20,
      }}
    >
      {[...Array(5)].map((_, index) => {
        const starValue = index + 1;
        return (
          <span
            key={index}
            style={{
              alignItems: 'center',
              color: starValue <= (hover || userRating)
                ? '#faaf00'
                : 'var(--mui-palette-text-secondary)',
              cursor: 'pointer',
              display: 'inline-flex',
              justifyContent: 'center',
              lineHeight: 1.57,
              minWidth: 15,
              maxHeight: 20,
              minHeight: 20,
              transform: hover === starValue ? 'scale(1.1)' : 'none',
            }}
            onClick={(e) => handleClick(e, starValue)}
            onMouseEnter={() => handleMouseEnter(starValue)}
            onMouseLeave={handleMouseLeave}
          >
            {starValue <= (hover || userRating)
              ? (<SvgIcon sx={{ width: 13 }}><BsStarFill /></SvgIcon>)
              : (<SvgIcon sx={{ width: 13 }}><BsDot /></SvgIcon>)}
          </span>
        );
      })}
    </div>
  );
};

export default Rating;
