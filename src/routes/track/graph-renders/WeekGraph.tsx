import { Box, Typography } from '@mui/material';
import moment from 'moment';
import { useState } from 'react';
import Graph from './Graph';

interface WeekGraphProps {
  scale: string[];
  total: number;
  days: {
    key: string;
    value: moment.Moment[];
  }[];
}

const WeekGraph = ({ scale, total, days }: WeekGraphProps) => {
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
          Playcount by day
        </Typography>
      </Box>
      <Graph
        activeColor={activeColor}
        data={days}
        scale={scale}
        setActiveColor={setActiveColor}
        total={total}
      />
    </>
  );
};

export default WeekGraph;
