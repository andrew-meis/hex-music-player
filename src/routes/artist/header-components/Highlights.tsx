import { Avatar, Box, Chip, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { Album, Artist, Hub, Library, Track } from 'hex-plex';
import { maxBy, sample } from 'lodash';
import React, { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';
import Palette from '../../../components/palette/Palette';
import { isAlbum, isArtist, isTrack } from '../../../types/type-guards';

const getMaxCards = (cards: number, height: number, width: number) => {
  if (width > 1011 && width < 1018) {
    if (cards < 6) return 3;
    if (cards >= 6) return 6;
  }
  if (width <= 1011) {
    if (cards < 4) return 2;
    if (cards >= 4) return 4;
  }
  return 3;
};

const linkState = (card: ArtistExt) => ({ guid: card.guid, title: card.title });

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

interface ArtistExt extends Artist {
  label: string;
}

interface TrackExt extends Track {
  label: string;
}

const Highlights = ({ artistData, height, library, navigate, width }: HighlightsProps) => {
  const queryClient = useQueryClient();
  const hotTrack = useMemo(() => {
    const hotTracks = queryClient.getQueryData<Track[]>(['top-tracks', 60 * 60 * 24 * 90, 300]);
    if (hotTracks !== undefined) {
      const filteredTracks = hotTracks
        .filter((track: Track) => track.grandparentId === artistData?.artist.id);
      return filteredTracks[0];
    }
    return undefined;
  }, [artistData, queryClient]);
  const cards = useMemo(() => {
    const array = [];
    if (hotTrack !== undefined) {
      array.push({ ...hotTrack, label: 'recent favorite' });
    }
    const similarArtistHub = artistData?.hubs.find((hub) => hub.hubIdentifier === 'artist.similar');
    if (similarArtistHub && similarArtistHub.items.length > 0) {
      const sampleSimilar = sample(similarArtistHub.items);
      array.push({ ...sampleSimilar, label: 'similar artist' });
    }
    if (artistData && artistData.albums.length > 0) {
      const topAlbum = maxBy(artistData.albums, (album) => album.viewCount);
      array.push({ ...topAlbum, label: 'top album' });
    }
    return array as (AlbumExt | ArtistExt | TrackExt)[];
  }, [artistData, hotTrack]);
  const maxCards = useMemo(() => getMaxCards(cards.length, height, width), [cards, height, width]);

  if (height < 280 || cards.length === 0) {
    return null;
  }

  return (
    <Box flex="1 0 300px">
      <Box bgcolor="background.paper" color="text.primary">
        <Typography fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
          Highlights
        </Typography>
      </Box>
      <Box display="flex" flexWrap="wrap" maxHeight={Math.floor(height / 96) * 96}>
        {cards.slice(0, maxCards).map((card) => {
          const thumbSrc = library.api
            .getAuthenticatedUrl(
              '/photo/:/transcode',
              { url: card.thumb, width: 100, height: 100 },
            );
          return (
            <Box
              alignItems="center"
              bgcolor="action.hover"
              borderRadius="4px"
              display="flex"
              flex="1 0 292px"
              height={88}
              key={card.id}
              mb="8px"
              mr="8px"
              sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
              onClick={() => navigate({
                artist: isArtist(card) ? `/artists/${card.id}` : '',
                album: isAlbum(card) ? `/albums/${card.id}` : '',
                track: isTrack(card) ? `/albums/${card.parentId}` : '',
              }[card.type] || '/', { state: isArtist(card) ? linkState(card) : null })}
            >
              <Avatar
                alt={card.title}
                src={thumbSrc}
                sx={{ width: 76, height: 76, marginX: '6px' }}
                variant={card.type === 'artist' ? 'circular' : 'rounded'}
              />
              <Box
                alignItems="flex-start"
                display="flex"
                flexDirection="column"
                mr="10px"
                width={1}
              >
                <Typography sx={textStyle}>
                  {card.title}
                </Typography>
                <Palette id={card.id} src={thumbSrc}>
                  {({ data: colors, isLoading }) => (
                    <Chip
                      label={card.label}
                      size="small"
                      sx={{
                        backgroundColor: isLoading
                          ? 'transparent'
                          : colors?.darkVibrant || ' #cccccc',
                        color: 'white.main',
                      }}
                    />
                  )}
                </Palette>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
};

export default Highlights;
