import { Avatar, Box, Typography } from '@mui/material';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { maxBy } from 'lodash';
import React, { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';

const textStyle = {
  color: 'text.primary',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.5,
  textDecoration: 'inherit',
};

interface HighlightsProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  height: number;
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

interface AlbumExt extends Album {
  label: string;
}

const Highlights = ({ artistData, height, library, navigate, width }: HighlightsProps) => {
  const card = useMemo(() => {
    if (artistData && artistData.albums.length > 0) {
      const recentAlbum = maxBy(artistData.albums, (album) => album.originallyAvailableAt);
      if (recentAlbum) {
        const now = new Date();
        const msBetweenDates = Math
          .abs(recentAlbum.originallyAvailableAt.getTime() - now.getTime());
        const daysBetweenDates = msBetweenDates / (24 * 60 * 60 * 1000);
        if (daysBetweenDates < 90) {
          return { ...recentAlbum, label: 'New Release' } as AlbumExt;
        }
      }
    }
    return undefined;
  }, [artistData]);
  const thumbSrc = card
    ? library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      { url: card.thumb, width: 300, height: 300 },
    )
    : '';

  if (height < 280 || width < 860 || !card) {
    return null;
  }

  return (
    <Box flex="1 0 210px">
      <Box bgcolor="background.paper" color="text.primary">
        <Typography fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
          {card.label}
        </Typography>
      </Box>
      <Box
        alignItems="center"
        borderRadius="4px"
        display="flex"
        flexDirection="column"
        height="calc(100% - 45px)"
        key={card.id}
        sx={{ cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
        onClick={() => navigate(`/albums/${card.id}`)}
      >
        <Avatar
          alt={card.title}
          src={thumbSrc}
          sx={{
            width: 210,
            height: 210,
          }}
          variant={card.type === 'artist' ? 'circular' : 'rounded'}
        />
        <Box
          alignItems="flex-start"
          display="flex"
          flexDirection="column"
          margin="auto"
          sx={{ textDecoration: 'inherit' }}
          width={1}
        >
          <Typography sx={textStyle}>
            {card.title}
          </Typography>
          <Typography color="text.primary" variant="subtitle2">
            {card.originallyAvailableAt
              .toLocaleDateString(
                'en-gb',
                { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' },
              )}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Highlights;
