import { Box, Fade, Typography } from '@mui/material';
import { useInView } from 'react-intersection-observer';
import { WIDTH_CALC } from 'constants/measures';
import FixedHeader from './FixedHeader';

const Header = ({ query }: { query: string }) => {
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
          <FixedHeader query={query} />
        </Box>
      </Fade>
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        height={70}
        ref={ref}
        width="auto"
      >
        <Typography fontWeight={600} variant="header">
          {`Search results for "${query}"`}
        </Typography>
      </Box>
    </>
  );
};

export default Header;
