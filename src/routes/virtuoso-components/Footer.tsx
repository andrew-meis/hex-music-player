import { Box } from '@mui/material';
import { WIDTH_CALC } from 'constants/measures';

const Footer = () => (
  <Box
    borderTop="1px solid"
    // eslint-disable-next-line react/jsx-sort-props
    borderColor="border.main"
    height="10px"
    maxWidth={900}
    mx="auto"
    width={WIDTH_CALC}
  />
);

export default Footer;
