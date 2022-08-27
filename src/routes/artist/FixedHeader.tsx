import { Avatar, Box, Typography } from '@mui/material';
import { Artist } from 'hex-plex';
import React from 'react';
import PlayShuffleButton from '../../components/play-shuffle-buttons/PlayShuffleButton';

interface FixedHeaderProps {
  artist: Artist;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  headerText: string;
  thumbSrcSm: string;
}

const FixedHeader = ({
  artist, handlePlay, handleShuffle, headerText, thumbSrcSm,
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
    width="89%"
  >
    <Avatar
      alt={artist.title}
      src={thumbSrcSm}
      sx={{ width: 60, height: 60 }}
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
      {artist.title}
      &nbsp;&nbsp;»&nbsp;&nbsp;
      {headerText ? `${headerText}` : ''}
    </Typography>
    <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
  </Box>
);

export default FixedHeader;
