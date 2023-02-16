import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import { IoMdMicrophone } from 'react-icons/all';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC_PADDING } from 'constants/measures';

interface FixedHeaderProps {
  artist: Artist;
  handlePlay: () => Promise<void>;
  handleRadio: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  headerText: string;
  thumbSrcSm: string;
}

const FixedHeader = ({
  artist, handlePlay, handleRadio, handleShuffle, headerText, thumbSrcSm,
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
    maxWidth="1600px"
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
      {artist.title}
      &nbsp;&nbsp;»&nbsp;&nbsp;
      {headerText ? `${headerText}` : ''}
    </Typography>
    <PlayShuffleButton
      handlePlay={handlePlay}
      handleRadio={handleRadio}
      handleShuffle={handleShuffle}
    />
  </Box>
);

export default FixedHeader;
