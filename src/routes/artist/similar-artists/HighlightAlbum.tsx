import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { maxBy } from 'lodash';
import React, { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';

interface HighlightAlbumProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  height: number;
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

interface AlbumExt extends Album {
  label: string;
}

const HighlightAlbum = ({ artistData, height, library, navigate, width }: HighlightAlbumProps) => {
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
      const topAlbum = maxBy(artistData.albums, (album) => album.viewCount);
      if (topAlbum && topAlbum.viewCount > 5) {
        return { ...topAlbum, label: 'Most Played' } as AlbumExt;
      }
    }
    return undefined;
  }, [artistData]);

  const measure = (Math.floor((height - 77) / 56)) * 56;

  const thumbSrc = useMemo(() => library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    { url: card?.thumb || '', width: measure > 250 ? 400 : 300, height: measure > 250 ? 400 : 300 },
  ), [card, library, measure]);

  if (width < 860 || !card) {
    return null;
  }

  return (
    <Box flex={`1 0 ${measure > 280 ? 280 : measure}px`}>
      <Box color="text.primary">
        <Typography fontFamily="TT Commons" fontSize="1.3rem">
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
        sx={{
          cursor: 'pointer',
          transform: 'scale(0.95)',
          transition: '0.2s',
          '&:hover': { transform: 'scale(1)' },
        }}
        onClick={() => navigate(`/albums/${card.id}`)}
      >
        <Tooltip
          arrow
          enterDelay={500}
          enterNextDelay={300}
          key={card.id}
          title={(
            <Typography color="common.white" textAlign="center">
              {card.title}
            </Typography>
          )}
        >
          <Avatar
            alt={card.title}
            src={thumbSrc}
            sx={{
              height: measure,
              maxHeight: 280,
              maxWidth: 280,
              width: measure,
            }}
            variant="rounded"
          />
        </Tooltip>
      </Box>
    </Box>
  );
};

export default HighlightAlbum;
