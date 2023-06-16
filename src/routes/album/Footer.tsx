import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { WIDTH_CALC } from 'constants/measures';
import { AlbumContext } from './Album';

const Footer = ({ context }: { context?: AlbumContext }) => {
  const { album: albumData } = context!;
  const { album } = albumData!;
  const countNoun = album.leafCount > 1 || album.leafCount === 0 ? 'tracks' : 'track';
  const releaseDate = moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');
  return (
    <Box
      alignItems="center"
      borderTop="1px solid"
      // eslint-disable-next-line react/jsx-sort-props
      borderColor="border.main"
      display="flex"
      height="30px"
      maxWidth={900}
      mx="auto"
      width={WIDTH_CALC}
    >
      <Typography
        color="text.secondary"
        sx={{
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 1,
          WebkitBoxOrient: 'vertical',
        }}
        variant="subtitle2"
        width="fit-content"
      >
        {
          // eslint-disable-next-line max-len
          `${releaseDate} · ${album.leafCount} ${countNoun}${album.studio ? ` · ${album.studio}` : ''}`
        }
      </Typography>
    </Box>
  );
};

Footer.defaultProps = {
  context: undefined,
};

export default Footer;
