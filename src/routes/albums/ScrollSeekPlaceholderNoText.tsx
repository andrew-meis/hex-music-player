import { Skeleton } from '@mui/lab';
import { Box } from '@mui/material';
import { AlbumsContext } from './Albums';

const ScrollSeekPlaceholderNoText = ({ context }: { context?: AlbumsContext }) => {
  const { grid: { cols }, measurements } = context!;
  const array = [...Array(cols).keys()];
  return (
    <Box
      display="flex"
      gap="8px"
      height={measurements.ROW_HEIGHT}
      mx="auto"
      width={measurements.ROW_WIDTH}
    >
      {array.map((value) => (
        <Skeleton
          height={measurements.IMAGE_SIZE}
          key={value}
          sx={{
            borderRadius: '4px',
          }}
          variant="rectangular"
          width={measurements.IMAGE_SIZE}
        />
      ))}
    </Box>
  );
};

ScrollSeekPlaceholderNoText.defaultProps = {
  context: undefined,
};

export default ScrollSeekPlaceholderNoText;
