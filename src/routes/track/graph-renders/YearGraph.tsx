import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import Graph from './Graph';

interface YearGraphProps {
  scale: string[];
  total: number;
  years: {
    key: string;
    value: moment.Moment[];
  }[];
}

const YearGraph = ({ scale, total, years }: YearGraphProps) => {
  const [activeColor, setActiveColor] = useState<{color: string, index: number} | null>(null);

  return (
    <>
      <Box
        alignItems="flex-end"
        color="text.secondary"
        display="flex"
        height={32}
        justifyContent="space-between"
      >
        <Typography>
          {years[0].key}
        </Typography>
        <Typography>
          {years.at(-1)?.key}
        </Typography>
      </Box>
      <Graph
        activeColor={activeColor}
        data={years}
        scale={scale}
        setActiveColor={setActiveColor}
        total={total}
      />
    </>
  );
};

export default YearGraph;
