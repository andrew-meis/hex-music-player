import { Box, Chip, Tooltip, Typography } from '@mui/material';
import chroma from 'chroma-js';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { Album, Artist, Hub } from 'hex-plex';
import { isEmpty } from 'lodash';
import Twemoji from 'react-twemoji';

interface InfoRowProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  colors: string[] | undefined;
}

const InfoRow = ({ artistData, colors }: InfoRowProps) => {
  const { artist } = artistData!;

  return (
    <Box
      alignItems="center"
      color="text.primary"
      display="flex"
      flex="1 0 100%"
      height="71px"
      justifyContent="space-between"
      sx={{ translate: '0px' }}
    >
      <Box width={120}>
        {!isEmpty(artist.country)
          && (
            <>
              {artist.country.map((country) => (
                <Tooltip
                  arrow
                  enterDelay={500}
                  enterNextDelay={300}
                  key={country.id}
                  placement="right"
                  title={(
                    <Typography color="common.white" textAlign="center">
                      {country.tag}
                    </Typography>
                  )}
                >
                  <Box fontSize="2.5rem" width="min-content">
                    <Twemoji>{flag(country.tag)}</Twemoji>
                  </Box>
                </Tooltip>
              ))}
            </>
          )}
      </Box>
      <Box
        display="flex"
        flexWrap="wrap"
        gap="8px"
        height="32px"
        justifyContent="center"
        overflow="hidden"
      >
        {artist.genre.map((genre, index) => {
          const color = colors ? colors[index % 6] : 'common.grey';
          return (
            <Chip
              key={genre.id}
              label={genre.tag.toLowerCase()}
              sx={{
                backgroundColor: color,
                transition: 'background 500ms ease-in, box-shadow 200ms ease-in',
                color: fontColorContrast(color),
                '&:hover': {
                  boxShadow: `inset 0 0 0 1000px ${chroma(color).brighten()}`,
                },
              }}
            />
          );
        })}
      </Box>
      <Box flexShrink={0} width={120}>
        {artist.viewCount > 0
          && (
            <Typography textAlign="right">
              {artist.viewCount}
              {' '}
              {artist.viewCount === 1 ? 'play' : 'plays'}
            </Typography>
          )}
      </Box>
    </Box>
  );
};

export default InfoRow;
