import { Skeleton } from '@mui/lab';
import { Box } from '@mui/material';
import { ArtistsContext } from './Artists';

// eslint-disable-next-line react/require-default-props
const ScrollSeekPlaceholder = ({ context }: { context?: ArtistsContext }) => {
  const { grid: { cols }, measurements } = context!;
  const array = [...Array(cols).keys()];
  return (
    <Box
      display="flex"
      height={measurements.ROW_HEIGHT}
      mx="auto"
      width={measurements.ROW_WIDTH}
    >
      {array.map((value) => (
        <Box
          alignItems="center"
          display="flex"
          flexDirection="column"
          key={value}
        >
          <Skeleton
            height={measurements.IMAGE_HEIGHT - 8}
            sx={{
              borderRadius: '32px',
              margin: '4px',
            }}
            variant="rectangular"
            width={measurements.IMAGE_WIDTH - 8}
          />
          <Skeleton
            height="20"
            sx={{
              borderRadius: '4px',
            }}
            variant="rectangular"
            width={measurements.IMAGE_WIDTH - 64}
          />
        </Box>
      ))}
    </Box>
  );
};

export default ScrollSeekPlaceholder;
