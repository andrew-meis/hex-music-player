import { Typography } from '@mui/material';
import React from 'react';
import { Link } from 'react-router-dom';
import { Library, Track } from 'api/index';
import Rating from 'components/rating/TrackRating';

const formatPlaycount = (x: number) => {
  switch (true) {
    case x === 1:
      return `${x} play`;
    case x > 1:
      return `${x} plays`;
    default:
      return 'unplayed';
  }
};

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
          {track.globalViewCount
            ? formatPlaycount(track.globalViewCount)
            : formatPlaycount(track.viewCount)}
        </Link>
      </Typography>
    )}
  </>
);

export default React.memo(RatingCell);
