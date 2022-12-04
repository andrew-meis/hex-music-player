import { Rating, SvgIcon } from '@mui/material';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import React from 'react';
import { BsDot } from 'react-icons/all';
import { useLibrary } from 'queries/app-queries';

// TODO all query keys should be refactored to include their main focus (e.g. track, album)
const invalidateTrackQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries(['album-tracks']);
  await queryClient.invalidateQueries(['artist-tracks']);
  await queryClient.invalidateQueries(['play-queue']);
  await queryClient.invalidateQueries(['playlist']);
  await queryClient.invalidateQueries(['top-tracks']);
  await queryClient.invalidateQueries(['top']);
};

interface TrackRatingProps {
  id: number;
  userRating: number;
}

const TrackRating = ({ id, userRating }: TrackRatingProps) => {
  const library = useLibrary();
  const queryClient = useQueryClient();

  const handleRatingChange = async (newValue: number | null) => {
    if (newValue === null) {
      await library.rate(id, -1);
      await invalidateTrackQueries(queryClient);
      return;
    }
    await library.rate(id, newValue * 2);
    await invalidateTrackQueries(queryClient);
  };

  return (
    <Rating
      emptyIcon={(
        <SvgIcon
          sx={{
            color: 'text.secondary',
            width: '16px',
            height: '16px',
          }}
        >
          <BsDot />
        </SvgIcon>
      )}
      name="track-rating"
      size="small"
      sx={{
        top: '2px',
        '&.MuiRating-root': {
          fontSize: '1rem',
        },
      }}
      value={userRating / 2}
      onChange={(event, newValue) => handleRatingChange(newValue)}
    />
  );
};

export default TrackRating;
