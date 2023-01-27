import { Rating, SvgIcon } from '@mui/material';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { BsDot } from 'react-icons/all';
import { useLibrary } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';

const invalidateTrackQueries = async (queryClient: QueryClient) => {
  await queryClient.invalidateQueries([QueryKeys.ALBUM_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_TRACKS]);
  await queryClient.invalidateQueries([QueryKeys.ARTIST_APPEARANCES]);
  await queryClient.invalidateQueries([QueryKeys.PLAYLIST]);
  await queryClient.invalidateQueries([QueryKeys.PLAYQUEUE]);
  await queryClient.invalidateQueries([QueryKeys.TOP]);
  await queryClient.invalidateQueries([QueryKeys.TRACK]);
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
