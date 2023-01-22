import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import Graph from './Graph';

interface MonthGraphProps {
  scale: string[];
  total: number;
  months: {
    key: string;
    value: moment.Moment[];
  }[];
}

const MonthGraph = ({ scale, total, months }: MonthGraphProps) => {
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
          Playcount by month
        </Typography>
      </Box>
      <Graph
        activeColor={activeColor}
        data={months}
        scale={scale}
        setActiveColor={setActiveColor}
        total={total}
      />
    </>
  );
};

export default MonthGraph;
