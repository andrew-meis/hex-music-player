import { Box, Chip, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuDivider, MenuItem } from '@szhsin/react-menu';
import chroma from 'chroma-js';
import { flag } from 'country-emoji';
import fontColorContrast from 'font-color-contrast';
import { isEmpty } from 'lodash';
import { useCallback } from 'react';
import emoji from 'react-easy-emoji';
import { SiMusicbrainz, TbBrandLastfm, TbExternalLink } from 'react-icons/all';
import { NavigateFunction } from 'react-router-dom';
import { Album, Artist, Hub } from 'api/index';
import IconMenuButton from 'components/buttons/IconMenuButton';
import Tooltip from 'components/tooltip/Tooltip';
import { artistButtons, ButtonSpecs } from 'constants/buttons';
import { PlayParams } from 'hooks/usePlayback';
import useRestoreAlbums from 'hooks/useRestoreAlbums';
import { PlayActions } from 'types/enums';

const countryMapper = (country: string) => {
  switch (country) {
    case 'Republic of Korea':
      return 'South Korea';
    default:
      return country;
  }
};

const FlagAndPlaycount = ({ artist }: {artist: Artist}) => (
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
                {emoji(flag(countryMapper(country.tag)))}
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
);

interface GenreChipsProps {
  artist: Artist;
  colors: string[] | undefined;
  navigate: NavigateFunction;
}

const GenreChips = ({ artist, colors, navigate }: GenreChipsProps) => (
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
            cursor: 'pointer',
            '&:hover': {
              boxShadow: `inset 0 0 0 1000px ${chroma(color).brighten()}`,
            },
          }}
          onClick={() => navigate(`/genres/${genre.id}`, { state: { title: genre.tag } })}
        />
      );
    })}
  </Box>
);

interface MenuBoxProps {
  artist: Artist;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  refreshMetadata: (id: number) => Promise<void>
  width: number;
}

const MenuBox = ({ artist, playSwitch, refreshMetadata, width }: MenuBoxProps) => {
  const mbid = (artist.mbid[0].id as unknown as string).slice(7);
  const filters = window.electron.readFilters('filters');
  const hasHiddenReleases = filters.findIndex((obj) => obj.artist === artist.guid) !== -1;
  const restoreAlbums = useRestoreAlbums();

  const handleMenuSelection = useCallback(async (button: ButtonSpecs) => {
    if (!artist) {
      return;
    }
    await playSwitch(button.action, { artist, shuffle: button.shuffle });
  }, [playSwitch, artist]);

  return (
    <Box
      alignItems="center"
      display="flex"
      flexShrink={0}
      justifyContent={width < 180 ? 'center' : 'flex-end'}
      maxWidth={width}
      minWidth={width}
    >
      <Menu
        arrow
        transition
        align="center"
        direction={width < 180 ? 'right' : 'left'}
        menuButton={({ open }) => <IconMenuButton open={open} width={16} />}
      >
        {artistButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        <MenuDivider />
        {hasHiddenReleases && (
          <MenuItem onClick={() => restoreAlbums(artist)}>
            Restore Hidden
          </MenuItem>
        )}
        <MenuItem onClick={() => refreshMetadata(artist.id)}>
          Refresh Metadata
        </MenuItem>
        <MenuDivider />
        <MenuItem href={`https://fanart.tv/artist/${mbid}`} target="_blank">
          fanart.tv
          <SvgIcon sx={{ height: '0.9em', ml: 'auto', width: '0.9em' }}>
            <TbExternalLink />
          </SvgIcon>
        </MenuItem>
        <MenuItem href={`https://www.last.fm/music/${artist.title}`} target="_blank">
          last.fm
          <SvgIcon sx={{ height: '0.9em', ml: 'auto', width: '0.9em' }}>
            <TbBrandLastfm />
          </SvgIcon>
        </MenuItem>
        <MenuItem href={`https://musicbrainz.org/artist/${mbid}`} target="_blank">
          MusicBrainz
          <SvgIcon sx={{ height: '0.8em', ml: 'auto', width: '0.8em' }}>
            <SiMusicbrainz />
          </SvgIcon>
        </MenuItem>
      </Menu>
    </Box>
  );
};

interface InfoRowProps {
  artistData: { albums: Album[], artist: Artist, hubs: Hub[] } | undefined;
  colors: string[] | undefined;
  navigate: NavigateFunction;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  refreshMetadata: (id: number) => Promise<void>
  width: number;
}

const InfoRow = ({
  artistData, colors, navigate, playSwitch, refreshMetadata, width,
}: InfoRowProps) => {
  const { artist } = artistData!;

  if (width < 500) {
    return (
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        flex="1 0 100%"
        height="71px"
        justifyContent="space-between"
      >
        <MenuBox
          artist={artist}
          playSwitch={playSwitch}
          refreshMetadata={refreshMetadata}
          width={32}
        />
        <FlagAndPlaycount artist={artist} />
        <GenreChips artist={artist} colors={colors} navigate={navigate} />
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
      justifyContent="space-between"
    >
      <FlagAndPlaycount artist={artist} />
      <GenreChips artist={artist} colors={colors} navigate={navigate} />
      <MenuBox
        artist={artist}
        playSwitch={playSwitch}
        refreshMetadata={refreshMetadata}
        width={180}
      />
    </Box>
  );
};

export default InfoRow;
