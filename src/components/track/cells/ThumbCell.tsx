import { Avatar } from '@mui/material';
import React from 'react';
import { Library, Track } from 'api/index';

const ThumbCell: React.FC<{
  library: Library,
  track: Track,
}> = ({ library, track }) => (
  <Avatar
    alt={track.title}
    src={library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
      },
    )}
    variant="rounded"
  />
);

export default React.memo(ThumbCell);
