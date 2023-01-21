import { Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import { groupBy } from 'lodash';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { PaletteState } from 'hooks/usePalette';
import { Playcount } from 'queries/track-query-fns';
import Graph from './Graph';

const sorter = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

interface WeekGraphProps {
  colors: PaletteState;
  trackHistory: Playcount[];
}

const WeekGraph = ({ colors, trackHistory }: WeekGraphProps) => {
  const [activeColor, setActiveColor] = useState<{color: string, index: number} | null>(null);
  const timepoints = useMemo(
    () => trackHistory.map((obj) => moment.unix(obj.viewedAt)),
    [trackHistory],
  );
  const groups = groupBy(timepoints, (date) => date.format('dddd'));
  const days = Object
    .keys(groups)
    .map((key) => ({ key, value: groups[key] }))
    .sort((a, b) => {
      const day1 = a.key as keyof typeof sorter;
      const day2 = b.key as keyof typeof sorter;
      return sorter[day1] - sorter[day2];
    });
  const colorArray = days.length > 6
    ? Object.values(colors)
    : [colors.darkVibrant, colors.lightVibrant, colors.vibrant];
  const scale = chroma
    .bezier(colorArray).scale().correctLightness().colors(days.length);

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
        total={timepoints.length}
      />
    </>
  );
};

export default WeekGraph;
