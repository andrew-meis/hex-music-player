import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { IoMdMicrophone } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import { Artist } from 'api/index';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC_PADDING } from 'constants/measures';

interface FixedHeaderProps {
  artist: Artist;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  thumbSrcSm: string;
}

const FixedHeader = ({
  artist, handlePlay, handleShuffle, thumbSrcSm,
}: FixedHeaderProps) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    paddingX="6px"
    width={WIDTH_CALC_PADDING}
  >
    <Avatar
      alt={artist.title}
      src={artist.thumb ? thumbSrcSm : ''}
      sx={{ width: 60, height: 60 }}
    >
      <SvgIcon
        className="generic-icon"
        sx={{ color: 'common.black' }}
      >
        <IoMdMicrophone />
      </SvgIcon>
    </Avatar>
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      <NavLink
        className="link"
        state={{ guid: artist.guid, title: artist.title }}
        to={`/artists/${artist.id}`}
      >
        {artist.title}
      </NavLink>
      &nbsp;&nbsp;»&nbsp;&nbsp;Recent Favorites
    </Typography>
    <PlayShuffleButton
      handlePlay={handlePlay}
      handleShuffle={handleShuffle}
    />
  </Box>
);

export default FixedHeader;
