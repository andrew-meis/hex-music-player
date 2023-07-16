import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Track } from 'api/index';
import Rating from 'components/rating/TrackRating';

const RatingCell: React.FC<{
  library: Library,
  showAdditionalRow: boolean,
  track: Track,
}> = ({ library, showAdditionalRow, track }) => (
  <>
    <div style={{ height: 20 }}>
      <Rating
        id={track.id}
        library={library}
        userRating={(track.userRating / 2) || 0}
      />
    </div>
    {showAdditionalRow && (
      <Typography fontSize="0.95rem" lineHeight="20px">
        <Link className="link" to={`/history/${track.id}`}>
          {
            track.viewCount
              ? `${track.viewCount} ${track.viewCount > 1
                ? 'plays'
                : 'play'}`
              : 'unplayed'
          }
        </Link>
      </Typography>
    )}
  </>
);

export default React.memo(RatingCell);
