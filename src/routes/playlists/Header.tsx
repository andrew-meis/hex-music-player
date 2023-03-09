import {
  Box, Fade, Typography,
} from '@mui/material';
import { useInView } from 'react-intersection-observer';
import FixedHeader from './FixedHeader';
import { PlaylistsContext } from './Playlists';

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: PlaylistsContext }) => {
  const { measurements } = context!;
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
          width={1}
          zIndex={400}
        >
          <FixedHeader
            width={measurements.ROW_WIDTH}
          />
        </Box>
      </Fade>
      <Box
        maxWidth="1600px"
        mx="auto"
        ref={ref}
        width={measurements.ROW_WIDTH}
      >
        <Box
          alignItems="center"
          borderBottom="1px solid"
          borderColor="border.main"
          color="text.primary"
          display="flex"
          height={70}
          paddingX="6px"
        >
          <Typography variant="h1">Playlists</Typography>
        </Box>
      </Box>
    </>
  );
};

export default Header;
