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
      gap="8px"
      height={measurements.ROW_HEIGHT + 8}
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
            height={(measurements.IMAGE_SIZE * 0.70) - 24}
            sx={{
              borderRadius: '32px',
              margin: '12px',
            }}
            variant="rectangular"
            width={measurements.IMAGE_SIZE - 24}
          />
          <Skeleton variant="text" width="40%" />
          <Skeleton variant="text" width="60%" />
        </Box>
      ))}
    </Box>
  );
};

export default ScrollSeekPlaceholder;
