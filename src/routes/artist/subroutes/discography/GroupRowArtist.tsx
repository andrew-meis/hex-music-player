import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import React from 'react';
import { IoMdMicrophone } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail } from 'hooks/plexHooks';
import { GroupRowArtistProps } from './Discography';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons',
  fontWeight: 600,
};

const GroupRowArtist = React.memo(({ artist, context }: GroupRowArtistProps) => {
  const {
    groups, playArtist, playArtistRadio,
  } = context!;
  const [thumbSrc] = useThumbnail(artist.thumb || 'none', 300);

  const handlePlay = () => playArtist(artist);
  const handleShuffle = () => playArtist(artist, true);
  const handlePlayRadio = () => playArtistRadio(artist);

  return (
    <Box
      alignItems="flex-end"
      bgcolor="background.paper"
      borderBottom="1px solid transparent"
      color="text.primary"
      display="flex"
      height={168}
      sx={{
        opacity: 1,
        transition: '300ms ease-in',
      }}
      onClick={context.handleClickAway}
      onMouseEnter={() => {
        context.hoverIndex.current = null;
      }}
    >
      <Avatar
        imgProps={{
          style: {
            objectPosition: 'center top',
          },
        }}
        src={artist.thumb ? thumbSrc : ''}
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
          handlePlay={handlePlay}
          handleRadio={handlePlayRadio}
          handleShuffle={handleShuffle}
        />
      </Box>
    </Box>
  );
});

export default GroupRowArtist;
