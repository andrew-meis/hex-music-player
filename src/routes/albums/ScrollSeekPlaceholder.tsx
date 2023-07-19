import { Skeleton } from '@mui/lab';
import { Box } from '@mui/material';
import { AlbumsContext } from './Albums';

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
            height={measurements.IMAGE_SIZE - 8}
            sx={{
              borderRadius: '4px',
              margin: '4px',
            }}
            variant="rectangular"
            width={measurements.IMAGE_SIZE - 8}
          />
          <Skeleton sx={{ marginLeft: '4px' }} variant="text" width="70%" />
          <Skeleton sx={{ marginLeft: '4px' }} variant="text" width="60%" />
        </Box>
      ))}
    </Box>
  );
};

ScrollSeekPlaceholder.defaultProps = {
  context: undefined,
};

export default ScrollSeekPlaceholder;
