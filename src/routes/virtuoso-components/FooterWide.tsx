import { Box } from '@mui/material';
import { WIDTH_CALC } from 'constants/measures';

const FooterWide = () => (
  <Box
    borderTop="1px solid transparent"
    height="30px"
    maxWidth={1600}
    mx="auto"
    width={WIDTH_CALC}
  />
);

export default FooterWide;
