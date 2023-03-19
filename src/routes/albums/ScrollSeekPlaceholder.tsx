import { Skeleton } from '@mui/lab';
import { Box } from '@mui/material';
import { AlbumsContext } from './Albums';

// eslint-disable-next-line react/require-default-props
const ScrollSeekPlaceholder = ({ context }: { context?: AlbumsContext }) => {
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
          display="flex"
          flexDirection="column"
          key={value}
        >
          <Skeleton
            height={measurements.IMAGE_SIZE - 24}
            sx={{
              borderRadius: '4px',
              margin: '12px',
            }}
            variant="rectangular"
            width={measurements.IMAGE_SIZE - 24}
          />
          <Skeleton
            height="20"
            sx={{
              borderRadius: '4px',
              marginLeft: '12px',
            }}
            variant="rectangular"
            width={measurements.IMAGE_SIZE - 64}
          />
        </Box>
      ))}
    </Box>
  );
};

export default ScrollSeekPlaceholder;
