import { Box, Chip, Typography } from '@mui/material';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { Album, Artist, Hub, Library } from 'hex-plex';
import { isEmpty } from 'lodash';
import { useMemo } from 'react';
import { NavigateFunction } from 'react-router-dom';
import Twemoji from 'react-twemoji';
import SimilarArtistAvatarGroup from './SimilarArtistAvatarGroup';

interface InfoRowProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  colors: string[] | undefined;
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const InfoRow = ({ artistData, colors, library, navigate, width }: InfoRowProps) => {
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

  if (width * 0.89 < 560) {
    return (
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        flex="1 0 100%"
        height="71px"
        sx={{ translate: '0px' }}
      >
        <SimilarArtistAvatarGroup
          artist={artist}
          library={library}
          navigate={navigate}
          similarArtists={similarArtists}
        />
      </Box>
    );
  }

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
      <Box display="flex" flexWrap="wrap" gap="8px" height="32px" mr="8px" overflow="hidden">
        {artist.genre.map((genre, index) => (
          <Chip
            key={genre.id}
            label={genre.tag.toLowerCase()}
            sx={{
              backgroundColor: colors ? colors[index % 6] : 'common.grey',
              transition: 'background 500ms ease-in, box-shadow 200ms ease-in',
              color: fontColorContrast(colors ? colors[index % 6] : 'common.grey'),
              '&:hover': {
                boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)',
              },
            }}
          />
        ))}
      </Box>
      <SimilarArtistAvatarGroup
        artist={artist}
        library={library}
        navigate={navigate}
        similarArtists={similarArtists}
      />
    </Box>
  );
};

export default InfoRow;
