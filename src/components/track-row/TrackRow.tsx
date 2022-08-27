import { Avatar, Box, Typography } from '@mui/material';
import { Library, Track } from 'hex-plex';
import React from 'react';
import PlayingAnimation from '../playing-animation/PlayingAnimation';
import TrackRating from '../rating/TrackRating';
import Subtext from '../subtext/Subtext';

const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};

interface TrackRowProps {
  getFormattedTime: (inMs: number) => string;
  index: number;
  isPlaying: boolean;
  library: Library;
  options: { showAlbumTitle: boolean, showArtwork: boolean };
  playing: boolean;
  track: Track;
}

const TrackRow = ({
  getFormattedTime, index, isPlaying, library, options, playing, track,
}: TrackRowProps) => (
  <>
    <Box maxWidth="10px" width="10px" />
    <Box
      display="flex"
      flexShrink={0}
      justifyContent="center"
      textAlign="center"
      width={40}
    >
      {playing && isPlaying
        ? (<PlayingAnimation />)
        : (<Typography fontSize="0.95rem">{index}</Typography>)}
    </Box>
    {options.showArtwork && (
      <Avatar
        alt={track.title}
        src={library.api.getAuthenticatedUrl(
          '/photo/:/transcode',
          {
            url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
          },
        )}
        sx={{ marginLeft: '8px', marginRight: '8px' }}
        variant="rounded"
      />
    )}
    <Box
      display="table"
      flexGrow={1}
      sx={{
        tableLayout: 'fixed',
      }}
      width={0.5}
    >
      <Typography
        color="text.primary"
        fontFamily="Rubik"
        fontSize="0.95rem"
        fontWeight={playing ? 600 : 'inherit'}
        sx={typographyStyle}
      >
        {track.title}
      </Typography>
      <Typography fontSize="0.875rem" sx={typographyStyle}>
        <Subtext showAlbum={options.showAlbumTitle} track={track} />
      </Typography>
    </Box>
    <Box flexShrink={0} mx="5px">
      <TrackRating
        id={track.id}
        userRating={track.userRating}
      />
      <Typography fontSize="0.95rem" textAlign="right">
        {
          track.viewCount
            ? `${track.viewCount} ${track.viewCount > 1 ? 'plays' : 'play'}`
            : 'unplayed'
        }
      </Typography>
    </Box>
    <Box
      sx={{
        width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
      }}
    >
      <Typography fontSize="0.95rem">
        {getFormattedTime(track.duration)}
      </Typography>
    </Box>
    <Box maxWidth="10px" width="10px" />
  </>
);

export default TrackRow;
