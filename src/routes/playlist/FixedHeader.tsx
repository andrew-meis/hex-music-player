import { Avatar, Box, Typography } from '@mui/material';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC_PADDING } from 'constants/measures';
import type { Playlist } from 'hex-plex';

interface FixedHeaderProps {
  playlist: Playlist;
  thumbSrcSm: string;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
}

const FixedHeader = ({
  playlist, thumbSrcSm, handlePlay, handleShuffle,
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
      alt={playlist.title}
      src={playlist.thumb || playlist.composite
        ? thumbSrcSm
        : undefined}
      sx={{ width: 60, height: 60 }}
      variant="rounded"
    />
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      {playlist.title}
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;
