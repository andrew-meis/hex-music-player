import { Avatar, Box, Typography } from '@mui/material';
import { Album } from 'api/index';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC_PADDING } from 'constants/measures';

interface FixedHeaderProps {
  album: Album;
  thumbSrcSm: string;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
}

const FixedHeader = ({
  album, thumbSrcSm, handlePlay, handleShuffle,
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
      alt={album.title}
      src={thumbSrcSm}
      sx={{ width: 60, height: 60 }}
      variant="rounded"
    />
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      {album.title}
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;
