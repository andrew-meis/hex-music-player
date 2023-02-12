import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { WIDTH_CALC } from 'constants/measures';

const Albums = () => {
  const location = useLocation();
  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
    >
      <Box
        mx="auto"
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          color="text.primary"
          display="flex"
          height={70}
        >
          <Typography variant="h1">Albums</Typography>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Albums;
