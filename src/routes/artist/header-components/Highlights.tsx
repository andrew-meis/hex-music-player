import { Box, Typography } from '@mui/material';
import React, { useMemo } from 'react';

const cards = [1, 2, 3, 4, 5, 6];

const getMaxCards = (cards: number, height: number, width: number) => {
  if (width > 1011 && width < 1018) {
    if (cards < 6) return 3;
    if (cards >= 6) return 6;
  }
  if (width <= 1011) {
    if (cards < 4) return 2;
    if (cards >= 4) return 4;
  }
  return 3;
};

interface HightlightsProps {
  height: number;
  width: number;
}

const Highlights = ({ height, width }: HightlightsProps) => {
  const maxCards = useMemo(() => getMaxCards(cards.length, height, width), [height, width]);

  if (height < 280) {
    return null;
  }

  return (
    <Box flex="1 0 300px">
      <Box bgcolor="background.paper" color="text.primary">
        <Typography fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
          Highlights
        </Typography>
      </Box>
      <Box display="flex" flexWrap="wrap" maxHeight={Math.floor(height / 96) * 96}>
        {cards.slice(0, maxCards).map((card) => (
          <Box
            bgcolor="action.hover"
            borderRadius="4px"
            flex="1 0 292px"
            height={88}
            key={card}
            mb="8px"
            mr="8px"
            sx={{ '&:hover': { backgroundColor: 'action.selected' } }}
          >
            <Typography color="text.primary">{card}</Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

export default Highlights;
