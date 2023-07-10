import { Typography } from '@mui/material';
import { CellContext } from '@tanstack/react-table';
import React from 'react';
import { Track } from 'api/index';
import PlayingAnimation from 'components/playing-animation/PlayingAnimation';

const IndexCell: React.FC<{
  info: CellContext<Track, number>,
  isPlaying: boolean,
  playing: boolean,
}> = ({ info, isPlaying, playing }) => (
  <>
    {playing && isPlaying
      ? (<PlayingAnimation />)
      : (<Typography fontSize="0.95rem">{info.getValue()}</Typography>)}
  </>
);

export default React.memo(IndexCell);
