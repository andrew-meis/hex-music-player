import { Avatar, Box } from '@mui/material';
import React from 'react';
import { Library, Track } from 'api/index';
import PlayingAnimation from 'components/playing-animation/PlayingAnimation';

const ThumbCell: React.FC<{
  isIndexVisible: boolean,
  isPlaying: boolean,
  library: Library,
  playing: boolean,
  track: Track,
}> = ({ isIndexVisible, isPlaying, library, playing, track }) => (
  <>
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
    {!isIndexVisible && playing && isPlaying && (
      <Box
        alignItems="center"
        bgcolor="rgba(0,0,0,0.4)"
        borderRadius="4px"
        display="flex"
        height={40}
        left={8}
        position="absolute"
        top={8}
        width={40}
      >
        <PlayingAnimation />
      </Box>
    )}
  </>
);

export default React.memo(ThumbCell);
