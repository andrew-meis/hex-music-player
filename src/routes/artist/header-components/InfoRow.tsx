import { Box, Chip, Typography } from '@mui/material';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { Artist } from 'hex-plex';
import { isEmpty } from 'lodash';
import React from 'react';
import Twemoji from 'react-twemoji';
import PlayShuffleButton from '../../../components/play-shuffle-buttons/PlayShuffleButton';
import usePlayback from '../../../hooks/usePlayback';

interface InfoRowProps {
  artist: Artist;
  colors: string[];
}

const InfoRow = ({ artist, colors }: InfoRowProps) => {
  const { playArtist } = usePlayback();

  const handlePlay = () => playArtist(artist);
  const handleShuffle = () => playArtist(artist, true);

  return (
    <Box
      alignItems="center"
      color="text.primary"
      display="flex"
      flex="1 0 100%"
      height="71px"
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
      <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
    </Box>
  );
};

export default InfoRow;
