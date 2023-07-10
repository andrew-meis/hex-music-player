/* eslint-disable jsx-a11y/no-static-element-interactions */
/* eslint-disable jsx-a11y/click-events-have-key-events */
/* eslint-disable react/no-array-index-key */
import { SvgIcon } from '@mui/material';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import { BsDot, BsStarFill } from 'react-icons/bs';
import { Library } from 'api/index';
import useMouseLeave from 'hooks/useMouseLeave';
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

const Rating = ({ id, library, userRating }: RatingProps) => {
  const precision = 0.5;
  const totalStars = 5;
  const queryClient = useQueryClient();
  const [hoverActiveStar, setHoverActiveStar] = useState(-1);
  const [isHovered, setIsHovered] = useState(false);
  const [mouseLeft, setRef, innerRef] = useMouseLeave();

  useEffect(() => {
    if (mouseLeft) {
      setHoverActiveStar(-1);
      setIsHovered(false);
    }
  }, [mouseLeft]);

  const calculateRating = (e: React.MouseEvent<HTMLDivElement>) => {
    const { width, left } = innerRef.current!.getBoundingClientRect();
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

  return (
    <div
      className="rating-container"
      ref={setRef}
      onClick={handleClick}
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
              <SvgIcon sx={{ width: 13, height: 20 }}>
                <BsStarFill />
              </SvgIcon>
            </div>
            <div
              style={{
                color: showEmptyIcon ? 'gray' : 'inherit',
              }}
            >
              <SvgIcon sx={{ width: 13, height: 20 }}>
                {showEmptyIcon ? <BsDot /> : <BsStarFill />}
              </SvgIcon>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Rating);
