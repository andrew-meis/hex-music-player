import { Skeleton } from '@mui/lab';
import { Box } from '@mui/material';

const ScrollSeekPlaceholderNoIndex = ({ height }: { height: number }) => (
  <Box alignItems="center" display="flex" height={height}>
    <Box width="10px" />
    <Box width="48px">
      <Skeleton
        height={40}
        sx={{ margin: 'auto', mr: '8px', borderRadius: '4px' }}
        variant="rectangular"
        width={40}
      />
    </Box>
    <Box flexGrow={1} width="50%">
      <Skeleton variant="text" width="50%" />
      <Skeleton variant="text" width="40%" />
    </Box>
    <Box mx="5px">
      <Skeleton variant="text" width="80px" />
    </Box>
    <Box width="50px">
      <Skeleton variant="text" width="50px" />
    </Box>
    <Box width="10px" />
  </Box>
);

export default ScrollSeekPlaceholderNoIndex;
