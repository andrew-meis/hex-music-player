import { Typography } from '@mui/material';
import { useParams } from 'react-router-dom';
import { useArtist } from '../../../hooks/queryHooks';
import { RouteParams } from '../../../types/interfaces';

const SimilarArtists = () => {
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const artist = useArtist(+id);
  console.log(artist.data);

  return (
    <Typography color="text.primary">
      empty page
    </Typography>
  );
};

export default SimilarArtists;
