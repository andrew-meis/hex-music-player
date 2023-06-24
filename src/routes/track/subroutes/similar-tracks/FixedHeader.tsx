import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { IoMdMicrophone } from 'react-icons/io';
import { NavLink } from 'react-router-dom';
import { Track } from 'api/index';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC_PADDING } from 'constants/measures';

interface FixedHeaderProps {
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  thumbSrcSm: string;
  track: Track;
}

const FixedHeader = ({
  handlePlay, handleShuffle, thumbSrcSm, track,
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
    maxWidth="888px"
    paddingX="6px"
    width={WIDTH_CALC_PADDING}
  >
    <Avatar
      alt={track.title}
      src={track.thumb ? thumbSrcSm : ''}
      sx={{ width: 60, height: 60 }}
      variant="rounded"
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
        to={`/albums/${track.parentId}`}
      >
        {track.title}
      </NavLink>
      &nbsp;&nbsp;»&nbsp;&nbsp;Similar Tracks
    </Typography>
    <PlayShuffleButton
      handlePlay={handlePlay}
      handleShuffle={handleShuffle}
    />
  </Box>
);

export default FixedHeader;
