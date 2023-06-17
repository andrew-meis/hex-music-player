/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { SvgIcon } from '@mui/material';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React, { useRef, useState } from 'react';
import { BsDot, BsStarFill } from 'react-icons/all';
import { Library } from 'api/index';
import { QueryKeys } from 'types/enums';

const invalidateTrackQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries([QueryKeys.ALBUM_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ALL_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_APPEARANCES]);
  await queryClient.invalidateQueries([QueryKeys.PLAYLIST_ITEMS]);
  await queryClient.invalidateQueries([QueryKeys.PLAYQUEUE]);
  await queryClient.invalidateQueries([QueryKeys.RECENT_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.SIMILAR_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.TOP]);
  await queryClient.invalidateQueries([QueryKeys.TRACK]);
  await queryClient.invalidateQueries([QueryKeys.TRACKS_BY_GENRE]);
};

interface RatingProps {
  id: number;
  library: Library;
  userRating: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const OldRating = ({ id, library, userRating }: RatingProps) => {
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
      {[...Array(5)].map((_arr, index) => {
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

const Rating = ({ id, library, userRating }: RatingProps) => {
  const precision = 0.5;
  const totalStars = 5;
  const queryClient = useQueryClient();
  const [hoverActiveStar, setHoverActiveStar] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
  const ratingContainerRef = useRef<HTMLDivElement | null>(null);

  const calculateRating = (e: React.MouseEvent<HTMLDivElement>) => {
    const { width, left } = ratingContainerRef.current!.getBoundingClientRect();
    const percent = (e.clientX - left) / width;
    const numberInStars = percent * totalStars;
    const nearestNumber = Math.round((numberInStars + precision / 2) / precision) * precision;

    return Number(nearestNumber.toFixed(precision.toString().split('.')[1]?.length || 0));
  };

  const handleClick = async (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    setIsHovered(false);
    const newRating = calculateRating(e);
    if (newRating === userRating) {
      await library.rate(id, -1);
      await invalidateTrackQueries(queryClient);
      return;
    }
    await library.rate(id, newRating * 2);
    await invalidateTrackQueries(queryClient);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    setHoverActiveStar(calculateRating(e));
  };

  const handleMouseLeave = () => {
    setHoverActiveStar(-1);
    setIsHovered(false);
  };

  return (
    <div
      ref={ratingContainerRef}
      style={{
        display: 'inline-flex',
        position: 'relative',
        cursor: 'pointer',
        textAlign: 'left',
        color: '#faaf00',
      }}
      onClick={handleClick}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      {[...new Array(totalStars)].map((arr, index) => {
        const activeState = isHovered ? hoverActiveStar : userRating;

        const showEmptyIcon = activeState === -1 || activeState < index + 1;

        const isActiveRating = activeState !== 1;
        const isRatingWithPrecision = activeState % 1 !== 0;
        const isRatingEqualToIndex = Math.ceil(activeState) === index + 1;
        const showRatingWithPrecision = isActiveRating
          && isRatingWithPrecision && isRatingEqualToIndex;

        return (
          <div
            className="rating-star"
            key={index}
            style={{
              cursor: 'pointer',
              margin: '0 1px',
              position: 'relative',
            }}
          >
            <div
              style={{
                width: showRatingWithPrecision ? `${(activeState % 1) * 100}%` : '0%',
                overflow: 'hidden',
                position: 'absolute',
              }}
            >
              <SvgIcon sx={{ width: 13 }}>
                <BsStarFill />
              </SvgIcon>
            </div>
            <div
              style={{
                color: showEmptyIcon ? 'gray' : 'inherit',
              }}
            >
              <SvgIcon sx={{ width: 13 }}>
                {showEmptyIcon ? <BsDot /> : <BsStarFill />}
              </SvgIcon>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Rating;
