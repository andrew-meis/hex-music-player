import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { Menu, MenuButton, MenuButtonProps, MenuItem } from '@szhsin/react-menu';
import { useQuery } from '@tanstack/react-query';
import React from 'react';
import { FaCaretDown, FaCaretUp, IoMdMicrophone } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail } from 'hooks/plexHooks';
import useMenuStyle from 'hooks/useMenuStyle';
import styles from 'styles/ArtistHeader.module.scss';
import { ArtistDiscographyContext } from './Discography';
import { GroupRowHeader } from './GroupRow';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons',
  fontWeight: 600,
};

interface FilterMenuButtonProps extends MenuButtonProps{
  filter: string;
  open: boolean;
}

const FilterMenuButton = React.forwardRef((
  { filter, open, onClick, onKeyDown }: FilterMenuButtonProps,
  ref,
) => (
  <MenuButton
    className={styles['sort-button']}
    ref={ref}
    onClick={onClick}
    onKeyDown={onKeyDown}
  >
    <Box
      alignItems="center"
      color={open ? 'text.primary' : 'text.secondary'}
      display="flex"
      height={32}
      justifyContent="space-between"
      sx={{
        '&:hover': {
          color: 'text.primary',
        },
      }}
      width={160}
    >
      <Typography>
        {filter}
      </Typography>
      <SvgIcon sx={{ height: 16, width: 16 }}>
        {(open ? <FaCaretUp /> : <FaCaretDown />)}
      </SvgIcon>
    </Box>
  </MenuButton>
));

interface FilterMenuItemProps {
  label: string;
  setFilter: React.Dispatch<React.SetStateAction<string>>;
}

const FilterMenuItem = ({ label, setFilter }: FilterMenuItemProps) => (
  <MenuItem
    onClick={() => setFilter(label)}
  >
    <Box alignItems="center" display="flex" justifyContent="space-between" width={1}>
      {label}
    </Box>
  </MenuItem>
);

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistDiscographyContext }) => {
  const {
    artist: artistData, filter, filters, groupCounts, groups,
    playAlbum, playArtist, playArtistRadio, setFilter, topmostGroup,
  } = context!;
  const { artist } = artistData!;
  const menuStyle = useMenuStyle();
  const trackLength = groupCounts[topmostGroup.current];

  const { data: atTop } = useQuery(
    ['at-top'],
    () => true,
    {
      initialData: true,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const { data: headerAlbum } = useQuery(
    ['discography-header-album'],
    () => groups[topmostGroup.current],
    {
      enabled: groups.length > 0,
      initialData: groups[topmostGroup.current],
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const [thumbSrcArtist] = useThumbnail(artist.thumb || 'none', 300);
  const [thumbSrc] = useThumbnail(headerAlbum.thumb || 'none', 300);

  const handlePlay = () => playAlbum(headerAlbum);
  const handleShuffle = () => playAlbum(headerAlbum, true);

  const handlePlayArtist = () => playArtist(artist);
  const handleShuffleArtist = () => playArtist(artist, true);
  const handlePlayArtistRadio = () => playArtistRadio(artist);

  return (
    <Box
      bgcolor="background.paper"
      display="flex"
      flexDirection="column"
      height={168}
      position="sticky"
      top={0}
      width={1}
      zIndex={100}
    >
      <Box
        alignItems="flex-end"
        borderBottom="1px solid"
        borderColor="border.main"
        color="text.primary"
        display="flex"
        height={1}
        marginX="auto"
        maxWidth={900}
        sx={{
          transform: 'translateZ(0px)',
        }}
        width="89%"
      >
        <Box
          position="absolute"
          right={0}
          top={0}
        >
          <Menu
            transition
            align="end"
            menuButton={({ open }) => <FilterMenuButton filter={filter} open={open} />}
            menuStyle={menuStyle}
          >
            {filters.map((option) => (
              <FilterMenuItem
                key={option}
                label={option}
                setFilter={setFilter}
              />
            ))}
          </Menu>
        </Box>
        {atTop && (
          <>
            <Avatar
              imgProps={{
                style: {
                  objectPosition: 'center top',
                },
              }}
              src={artist.thumb ? thumbSrcArtist : ''}
              sx={{
                borderRadius: '12px',
                height: 152,
                margin: '8px',
                ml: 0,
                width: Math.floor(152 * (10 / 7)),
              }}
            >
              <SvgIcon
                className="generic-artist"
                sx={{ alignSelf: 'center', color: 'common.black', height: '65%', width: '65%' }}
              >
                <IoMdMicrophone />
              </SvgIcon>
            </Avatar>
            <Box alignItems="flex-end" display="flex" flexGrow={1} mb="10px">
              <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
                <Box display="flex" height={18}>
                  <Typography variant="subtitle2">
                    discography
                  </Typography>
                </Box>
                <Typography
                  sx={titleStyle}
                  variant="h4"
                >
                  <NavLink
                    className="link"
                    state={{ guid: artist.guid, title: artist.title }}
                    to={`/artists/${artist.id}`}
                  >
                    {artist.title}
                  </NavLink>
                </Typography>
                <Box alignItems="flex-end" display="flex" flexWrap="wrap" mt="4px">
                  <Typography
                    sx={{
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: 'vertical',
                    }}
                    variant="subtitle2"
                    width="fit-content"
                  >
                    {`${groups.length} ${groups.length > 1 ? 'releases' : 'release'}`}
                  </Typography>
                </Box>
              </Box>
              <PlayShuffleButton
                handlePlay={handlePlayArtist}
                handleRadio={handlePlayArtistRadio}
                handleShuffle={handleShuffleArtist}
              />
            </Box>
          </>
        )}
        {!!headerAlbum && !atTop && (
          <GroupRowHeader
            album={headerAlbum}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            thumbSrc={thumbSrc}
            trackLength={trackLength}
          />
        )}
      </Box>
    </Box>
  );
};

export default Header;
