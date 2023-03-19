import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import { RiAlbumFill } from 'react-icons/all';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';

interface FixedHeaderProps {
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  width: number;
}

const FixedHeader = ({ handlePlay, handleShuffle, width }: FixedHeaderProps) => (
  <Box
    alignItems="center"
    bgcolor="background.paper"
    borderBottom="1px solid"
    borderColor="border.main"
    color="text.primary"
    display="flex"
    height={70}
    marginX="auto"
    maxWidth="1588px"
    paddingX="6px"
    width={width - 12}
  >
    <Avatar
      alt="Chart"
      sx={{
        background: `linear-gradient(
          to bottom right,
          var(--mui-palette-primary-main),
          rgba(var(--mui-palette-primary-mainChannel) / 0.60))`,
        width: 60,
        height: 60,
      }}
      variant="rounded"
    >
      <SvgIcon sx={{ height: 40, width: 40 }}>
        <RiAlbumFill />
      </SvgIcon>
    </Avatar>
    <Typography
      alignSelf="center"
      ml="10px"
      variant="header"
      width={1}
    >
      Albums
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;
