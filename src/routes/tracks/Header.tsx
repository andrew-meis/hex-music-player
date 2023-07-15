import { Box, Fade, Typography } from '@mui/material';
import React from 'react';
import { useInView } from 'react-intersection-observer';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { WIDTH_CALC } from 'constants/measures';
import FixedHeader from './FixedHeader';

const Header: React.FC<{
  handlePlayNow: (key?: string, shuffle?: boolean) => Promise<void>,
}> = ({ handlePlayNow }) => {
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

  const handlePlay = () => handlePlayNow();
  const handleShuffle = () => handlePlayNow(undefined, true);

  return (
    <>
      <Fade
        in={!inView && ((entry ? entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          maxWidth="1600px"
          position="fixed"
          width={1}
          zIndex={400}
        >
          <FixedHeader
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
          />
        </Box>
      </Fade>
      <Box
        mx="auto"
        ref={ref}
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          color="text.primary"
          display="flex"
          height={70}
          paddingX="6px"
        >
          <Typography variant="h1">Tracks</Typography>
          <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
        </Box>
      </Box>
    </>
  );
};

export default Header;
