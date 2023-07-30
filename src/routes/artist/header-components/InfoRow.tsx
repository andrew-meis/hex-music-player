import { Box, SvgIcon, Typography } from '@mui/material';
import { ControlledMenu, MenuDivider, MenuItem, useMenuState } from '@szhsin/react-menu';
import { flag } from 'country-emoji';
import { isEmpty } from 'lodash';
import { useCallback, useRef } from 'react';
import emoji from 'react-easy-emoji';
import { RiHistoryFill } from 'react-icons/ri';
import { SiMusicbrainz } from 'react-icons/si';
import { TbExternalLink, TbBrandLastfm } from 'react-icons/tb';
import { NavigateFunction } from 'react-router-dom';
import { Album, Artist, Hub } from 'api/index';
import { ChipGenres } from 'components/chips';
import { MenuIcon } from 'components/menus';
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
    {artist.viewCount > 0 && (
      <Typography textAlign="right">
        {artist.viewCount}
        {' '}
        {artist.viewCount === 1 ? 'play' : 'plays'}
      </Typography>
    )}
    {!artist.viewCount && (
      <Typography textAlign="right">
        unplayed
      </Typography>
    )}
  </Box>
);

interface MenuBoxProps {
  artist: Artist;
  navigate: NavigateFunction;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  refreshMetadata: (id: number) => Promise<void>
  width: number;
}

const MenuBox = ({ artist, navigate, playSwitch, refreshMetadata, width }: MenuBoxProps) => {
  const menuRef = useRef<HTMLDivElement | null>(null);
  const mbid = (artist.mbid[0].id as unknown as string).slice(7);
  const filters = window.electron.readFilters('filters');
  const hasHiddenReleases = filters?.findIndex((obj) => obj.artist === artist.guid) !== -1;
  const restoreAlbums = useRestoreAlbums();
  const [menuProps, toggleMenu] = useMenuState({ transition: true, unmountOnClose: true });

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
      <MenuIcon
        height={32}
        menuRef={menuRef}
        menuState={menuProps.state}
        toggleMenu={toggleMenu}
        width={24}
      />
      <ControlledMenu
        arrow
        portal
        align="center"
        anchorRef={menuRef}
        boundingBoxPadding="10"
        direction={width < 180 ? 'right' : 'left'}
        onClose={() => toggleMenu(false)}
        {...menuProps}
      >
        {artistButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        <MenuDivider />
        <MenuItem onClick={() => navigate(`/history/${artist.id}`)}>
          <SvgIcon sx={{ mr: '8px' }}><RiHistoryFill /></SvgIcon>
          View play history
        </MenuItem>
        <MenuDivider />
        {hasHiddenReleases && (
          <MenuItem onClick={() => restoreAlbums(artist)}>
            Restore hidden
          </MenuItem>
        )}
        <MenuItem onClick={() => refreshMetadata(artist.id)}>
          Refresh metadata
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
      </ControlledMenu>
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
        height={72}
        justifyContent="space-between"
      >
        <MenuBox
          artist={artist}
          navigate={navigate}
          playSwitch={playSwitch}
          refreshMetadata={refreshMetadata}
          width={32}
        />
        <FlagAndPlaycount artist={artist} />
        <ChipGenres colors={colors} genres={artist.genre} navigate={navigate} />
      </Box>
    );
  }

  return (
    <Box
      alignItems="center"
      color="text.primary"
      display="flex"
      flex="1 0 100%"
      height={72}
      justifyContent="space-between"
    >
      <FlagAndPlaycount artist={artist} />
      <ChipGenres colors={colors} genres={artist.genre} navigate={navigate} />
      <MenuBox
        artist={artist}
        navigate={navigate}
        playSwitch={playSwitch}
        refreshMetadata={refreshMetadata}
        width={180}
      />
    </Box>
  );
};

export default InfoRow;
