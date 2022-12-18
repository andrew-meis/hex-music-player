import { Box, Chip, Typography } from '@mui/material';
import { MenuItem } from '@szhsin/react-menu';
import chroma from 'chroma-js';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { Album, Artist, Hub } from 'hex-plex';
import { isEmpty } from 'lodash';
import Twemoji from 'react-twemoji';
import ActionMenu from 'components/action-menu/ActionMenu';
import Tooltip from 'components/tooltip/Tooltip';

interface InfoRowProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  colors: string[] | undefined;
  refreshMetadata: (id: number) => Promise<void>
}

const InfoRow = ({ artistData, colors, refreshMetadata }: InfoRowProps) => {
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
      <Box
        alignItems="center"
        display="flex"
        justifyContent="flex-start"
        maxWidth={180}
        minWidth={180}
      >
        {!isEmpty(artist.country)
          && (
            <>
              {artist.country.map((country) => (
                <Tooltip
                  key={country.id}
                  placement="right"
                  title={country.tag}
                >
                  <Box fontSize="2.5rem" width="min-content">
                    <Twemoji>{flag(country.tag)}</Twemoji>
                  </Box>
                </Tooltip>
              ))}
              <Typography flexShrink={0} mx="8px">
                ┊
              </Typography>
            </>
          )}
        {artist.viewCount > 0
          && (
            <Typography textAlign="right">
              {artist.viewCount}
              {' '}
              {artist.viewCount === 1 ? 'play' : 'plays'}
            </Typography>
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
      <Box
        alignItems="center"
        display="flex"
        flexShrink={0}
        justifyContent="flex-end"
        maxWidth={180}
        minWidth={180}
      >
        <ActionMenu
          align="end"
        >
          <MenuItem onClick={() => refreshMetadata(artist.id)}>
            Refresh Metadata
          </MenuItem>
        </ActionMenu>
      </Box>
    </Box>
  );
};

export default InfoRow;
