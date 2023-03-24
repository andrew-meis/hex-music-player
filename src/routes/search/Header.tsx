import { Box, Fade, Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { WIDTH_CALC } from 'constants/measures';
import FixedHeader from './FixedHeader';

const Header = () => {
  const { ref, inView, entry } = useInView({ threshold: [0.99, 0] });

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
          width={WIDTH_CALC}
          zIndex={400}
        >
          <FixedHeader />
        </Box>
      </Fade>
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        height={70}
        paddingX="6px"
        ref={ref}
        width="auto"
      >
        <Typography variant="h1">Search</Typography>
      </Box>
    </>
  );
};

export default Header;
