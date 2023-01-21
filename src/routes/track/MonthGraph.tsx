import { Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import { groupBy } from 'lodash';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { PaletteState } from 'hooks/usePalette';
import { Playcount } from 'queries/track-query-fns';
import Graph from './Graph';

const sorter = {
  January: 1,
  February: 2,
  March: 3,
  April: 4,
  May: 5,
  June: 6,
  July: 7,
  August: 8,
  September: 9,
  October: 10,
  November: 11,
  December: 12,
};

interface MonthGraphProps {
  colors: PaletteState;
  trackHistory: Playcount[];
}

const MonthGraph = ({ colors, trackHistory }: MonthGraphProps) => {
  const [activeColor, setActiveColor] = useState<{color: string, index: number} | null>(null);
  const timepoints = useMemo(
    () => trackHistory.map((obj) => moment.unix(obj.viewedAt)),
    [trackHistory],
  );
  const groups = groupBy(timepoints, (date) => date.format('MMMM'));
  const months = Object
    .keys(groups)
    .map((key) => ({ key, value: groups[key] }))
    .sort((a, b) => {
      const day1 = a.key as keyof typeof sorter;
      const day2 = b.key as keyof typeof sorter;
      return sorter[day1] - sorter[day2];
    });
  const colorArray = months.length > 6
    ? Object.values(colors)
    : [colors.darkVibrant, colors.lightVibrant, colors.vibrant];
  const scale = chroma
    .bezier(colorArray).scale().correctLightness().colors(months.length);

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
        total={timepoints.length}
      />
    </>
  );
};

export default MonthGraph;
