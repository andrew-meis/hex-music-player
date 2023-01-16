import { Box, Chip, Typography } from '@mui/material';
import { MenuDivider, MenuItem } from '@szhsin/react-menu';
import chroma from 'chroma-js';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { Album, Artist, Hub } from 'hex-plex';
import { isEmpty } from 'lodash';
import emoji from 'react-easy-emoji';
import ActionMenu from 'components/action-menu/ActionMenu';
import Tooltip from 'components/tooltip/Tooltip';
import useRestoreAlbums from 'hooks/useRestoreAlbums';

interface InfoRowProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  colors: string[] | undefined;
  refreshMetadata: (id: number) => Promise<void>
  refreshPage: () => void;
}

const InfoRow = ({ artistData, colors, refreshMetadata, refreshPage }: InfoRowProps) => {
  const { artist } = artistData!;

  const filters = window.electron.readFilters('filters');
  const hasHiddenReleases = filters.findIndex((obj) => obj.artist === artist.guid) !== -1;
  const restoreAlbums = useRestoreAlbums();

  return (
    <Box
      alignItems="center"
      color="text.primary"
      display="flex"
      flex="1 0 100%"
      height="71px"
      justifyContent="space-between"
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
                  <Box display="flex" fontSize="2.5rem" width="min-content">
                    {emoji(flag(country.tag))}
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
          <MenuItem onClick={() => refreshPage()}>
            Reload Page
          </MenuItem>
          {hasHiddenReleases && (
            <MenuItem onClick={() => restoreAlbums(artist)}>
              Restore Hidden
            </MenuItem>
          )}
          <MenuDivider />
          <MenuItem onClick={() => refreshMetadata(artist.id)}>
            Refresh Metadata
          </MenuItem>
        </ActionMenu>
      </Box>
    </Box>
  );
};

export default InfoRow;
