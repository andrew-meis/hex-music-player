import { Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import { groupBy } from 'lodash';
import moment from 'moment';
import { useMemo, useState } from 'react';
import { PaletteState } from 'hooks/usePalette';
import { Playcount } from 'queries/track-query-fns';
import Graph from './Graph';

interface YearGraphProps {
  colors: PaletteState;
  trackHistory: Playcount[];
}

const YearGraph = ({ colors, trackHistory }: YearGraphProps) => {
  const [activeColor, setActiveColor] = useState<{color: string, index: number} | null>(null);
  const timepoints = useMemo(
    () => trackHistory.map((obj) => moment.unix(obj.viewedAt)),
    [trackHistory],
  );
  const groups = groupBy(timepoints, (date) => date.format('YYYY'));
  const years = Object
    .keys(groups)
    .map((key) => ({ key, value: groups[key] }))
    .sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10));
  const colorArray = years.length > 6
    ? Object.values(colors)
    : [colors.darkVibrant, colors.lightVibrant, colors.vibrant];
  const scale = chroma
    .bezier(colorArray).scale().correctLightness().colors(years.length);

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
        total={timepoints.length}
      />
    </>
  );
};

export default YearGraph;
