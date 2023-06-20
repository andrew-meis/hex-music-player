import { Box, Chip } from '@mui/material';
import chroma, { contrast } from 'chroma-js';
import { NavigateFunction } from 'react-router-dom';
import { Tag } from 'api/index';

interface GenreChipsProps {
  colors: string[] | undefined;
  genres: Tag[];
  navigate: NavigateFunction;
}

const ChipGenres = ({ colors, genres, navigate }: GenreChipsProps) => (
  <Box
    display="flex"
    flexWrap="wrap"
    gap="8px"
    height="32px"
    justifyContent="center"
    overflow="hidden"
  >
    {genres.map((genre, index) => {
      const color = colors ? colors[index % 6] : 'common.grey';
      return (
        <Chip
          key={genre.id}
          label={genre.tag.toLowerCase()}
          sx={{
            backgroundColor: color,
            transition: 'background 500ms ease-in, box-shadow 200ms ease-in',
            color: contrast(color, 'black') > contrast(color, 'white')
              ? 'black'
              : 'white',
            cursor: 'pointer',
            '&:hover': {
              backgroundColor: color,
              boxShadow: `inset 0 0 0 1000px ${chroma(color).brighten()}`,
            },
          }}
          onClick={() => navigate(`/genres/${genre.id}`, { state: { title: genre.tag } })}
        />
      );
    })}
  </Box>
);

export default ChipGenres;
