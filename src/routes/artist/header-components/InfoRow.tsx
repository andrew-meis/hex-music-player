import { Avatar, AvatarGroup, Box, Chip, Tooltip, Typography } from '@mui/material';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { isEmpty } from 'lodash';
import React, { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';
import Twemoji from 'react-twemoji';

interface InfoRowProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  colors: string[];
  library: Library;
  navigate: NavigateFunction;
}

const InfoRow = ({ artistData, colors, library, navigate }: InfoRowProps) => {
  const { artist } = artistData!;
  const similarArtists = useMemo(() => {
    const similar = artistData?.hubs.find((hub) => hub.hubIdentifier === 'artist.similar');
    const sonicSimilar = artistData?.hubs
      .find((hub) => hub.hubIdentifier === 'external.artist.similar.sonically');
    let array = [];
    if (similar && similar.items.length > 0) {
      array.push(...similar.items);
    }
    if (sonicSimilar && sonicSimilar.items.length > 0) {
      array.push(...sonicSimilar.items);
    }
    array = [...new Map(array.map((item) => [item.id, item])).values()];
    return array as Artist[];
  }, [artistData]);

  return (
    <Box
      alignItems="center"
      color="text.primary"
      display="flex"
      flex="1 0 100%"
      height="71px"
      sx={{ translate: '0px' }}
    >
      {!isEmpty(artist.country)
        && (
          <>
            {artist.country.map((country) => (
              <Box fontSize="2.5rem" key={country.id} title={country.tag}>
                <Twemoji>{flag(country.tag)}</Twemoji>
              </Box>
            ))}
            <Typography flexShrink={0} mx="12px">
              ┊
            </Typography>
          </>
        )}
      {artist.viewCount > 0
        && (
          <>
            <Typography flexShrink={0}>
              {artist.viewCount}
              {' '}
              {artist.viewCount === 1 ? 'play' : 'plays'}
            </Typography>
            <Typography flexShrink={0} mx="12px">
              ┊
            </Typography>
          </>
        )}
      <Box flexWrap="wrap" height="32px" overflow="hidden">
        {artist.genre.map((genre, index) => (
          <Chip
            key={genre.id}
            label={genre.tag.toLowerCase()}
            sx={{
              ml: index === 0 ? '0px' : '10px',
              backgroundColor: colors[index],
              transition: 'background 500ms ease-in, box-shadow 200ms ease-in',
              color: fontColorContrast(colors[index]),
              '&:hover': {
                boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)',
              },
            }}
          />
        ))}
      </Box>
      <AvatarGroup
        componentsProps={{
          additionalAvatar: { onClick: () => navigate(`/artists/${artist.id}/similar`) },
        }}
        max={similarArtists.length < 5 ? similarArtists.length - 1 : 5}
        sx={{
          marginLeft: 'auto',
          '& .MuiAvatar-root': {
            border: 'none',
            cursor: 'pointer',
            height: 54,
            width: 54,
            transform: 'scale(0.95)',
            transition: '0.2s',
            '&:hover': { transform: 'scale(1) translateZ(0px)' },
          },
        }}
      >
        {similarArtists?.map((similarArtist) => {
          const thumbSrc = library.api
            .getAuthenticatedUrl(
              '/photo/:/transcode',
              { url: similarArtist.thumb, width: 100, height: 100 },
            );
          return (
            <Tooltip
              arrow
              enterDelay={500}
              enterNextDelay={300}
              key={similarArtist.id}
              title={(
                <Typography color="text.primary" textAlign="center">
                  {similarArtist.title}
                </Typography>
              )}
            >
              <Avatar
                alt={similarArtist.title}
                src={thumbSrc}
                sx={{
                  filter: 'grayscale(60%)',
                  '&:hover': { filter: 'none' },
                }}
                onClick={() => navigate(
                  `/artists/${similarArtist.id}`,
                  { state: { guid: similarArtist.guid, title: similarArtist.title } },
                )}
              />
            </Tooltip>
          );
        })}
      </AvatarGroup>
      {similarArtists
        && (
          <Typography
            position="absolute"
            sx={{ top: '-8px', right: '4px' }}
            variant="subtitle2"
          >
            similar artists
          </Typography>
        )}
    </Box>
  );
};

export default InfoRow;
