import { Avatar, Box, Typography } from '@mui/material';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
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
    width="calc(89% - 12px)"
  >
    <Avatar
      alt={playlist.title}
      src={thumbSrcSm}
      sx={{ width: 60, height: 60 }}
      variant="rounded"
    />
    <Typography
      alignSelf="center"
      fontFamily="TT Commons"
      fontSize="1.75rem"
      fontWeight={600}
      ml="10px"
      variant="h5"
      width={1}
    >
      {playlist.title}
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;
