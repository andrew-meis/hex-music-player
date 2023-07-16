import { Typography } from '@mui/material';
import React from 'react';
import PlayingAnimation from 'components/playing-animation/PlayingAnimation';

const IndexCell: React.FC<{
  index: number,
  isPlaying: boolean,
  playing: boolean,
}> = ({ index, isPlaying, playing }) => (
  <>
    {playing && isPlaying
      ? (<PlayingAnimation />)
      : (
        <Typography fontSize="0.95rem">
          {index}
        </Typography>
      )}
  </>
);

export default React.memo(IndexCell);
