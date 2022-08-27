import { Avatar, Box, Typography } from '@mui/material';
import React from 'react';
import TrackRating from '../../components/rating/TrackRating';
import { useLibrary, useNowPlaying } from '../../hooks/queryHooks';
import Subtext from '../../components/subtext/Subtext';

const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};

const NowPlaying = () => {
  const library = useLibrary();
  const { data: nowPlaying } = useNowPlaying();
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: nowPlaying ? nowPlaying.track.thumb : '',
      width: 100,
      height: 100,
      minSize: 1,
      upscale: 1,
    },
  );

  if (!nowPlaying) {
    return null;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        width: '100%',
        height: '100%',
        alignItems: 'center',
      }}
    >
      <Avatar
        alt={nowPlaying.track.title}
        src={thumbSrc}
        sx={{ width: 74, height: 74, marginX: '8px' }}
        variant="rounded"
      />
      <Box
        sx={{
          display: 'table',
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <Typography sx={{
          ...typographyStyle,
          fontFamily: 'Rubik, sans-serif',
          fontSize: '0.95rem',
          fontWeight: 600,
          color: 'text.primary',
        }}
        >
          {nowPlaying.track.title}
        </Typography>
        <Typography sx={{ ...typographyStyle, fontSize: '0.875rem', color: 'text.secondary' }}>
          <Subtext showAlbum track={nowPlaying.track} />
        </Typography>
        <TrackRating
          id={nowPlaying.track.id}
          userRating={nowPlaying.track.userRating}
        />
      </Box>
    </Box>
  );
};

export default NowPlaying;
