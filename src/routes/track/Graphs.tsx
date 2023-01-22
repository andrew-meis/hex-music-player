import { Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import { groupBy } from 'lodash';
import moment from 'moment';
import { useMemo } from 'react';
import { PaletteState } from 'hooks/usePalette';
import MonthGraph from './graph-renders/MonthGraph';
import WeekGraph from './graph-renders/WeekGraph';
import YearGraph from './graph-renders/YearGraph';

const daysSort = {
  Monday: 1,
  Tuesday: 2,
  Wednesday: 3,
  Thursday: 4,
  Friday: 5,
  Saturday: 6,
  Sunday: 7,
};

const monthsSort = {
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

interface GraphsProps {
  colors: PaletteState;
  moments: moment.Moment[];
}

const Graphs = ({ colors, moments }: GraphsProps) => {
  const data = useMemo(() => {
    const groupsYears = groupBy(moments, (date) => date.format('YYYY'));
    const years = Object
      .keys(groupsYears)
      .map((key) => ({ key, value: groupsYears[key] }))
      .sort((a, b) => parseInt(a.key, 10) - parseInt(b.key, 10));
    const groupsMonths = groupBy(moments, (date) => date.format('MMMM'));
    const months = Object
      .keys(groupsMonths)
      .map((key) => ({ key, value: groupsMonths[key] }))
      .sort((a, b) => {
        const day1 = a.key as keyof typeof monthsSort;
        const day2 = b.key as keyof typeof monthsSort;
        return monthsSort[day1] - monthsSort[day2];
      });
    const groupsDays = groupBy(moments, (date) => date.format('dddd'));
    const days = Object
      .keys(groupsDays)
      .map((key) => ({ key, value: groupsDays[key] }))
      .sort((a, b) => {
        const day1 = a.key as keyof typeof daysSort;
        const day2 = b.key as keyof typeof daysSort;
        return daysSort[day1] - daysSort[day2];
      });
    const colorPairs = Object.values(colors)
      .flatMap((v, i) => Object.values(colors).slice(i + 1).map((w) => [v, w]));
    const differentColors = colorPairs.map((pair) => chroma.deltaE(pair[0], pair[1]));
    const maxIndex = differentColors.reduce((iMax, x, i, arr) => (x > arr[iMax] ? i : iMax), 0);
    const scale = chroma
      .scale(colorPairs[maxIndex])
      .mode('lch')
      .colors(Math.max(years.length, months.length, days.length));
    return { years, months, days, scale };
  }, [colors, moments]);

  return (
    <>
      <Typography
        color="text.primary"
        fontFamily="TT Commons"
        fontSize="1.625rem"
      >
        Playback Statistics
      </Typography>
      <YearGraph
        scale={data.scale}
        total={moments.length}
        years={data.years}
      />
      <Box mt="32px" />
      <MonthGraph
        months={data.months}
        scale={data.scale}
        total={moments.length}
      />
      <Box mt="32px" />
      <WeekGraph
        days={data.days}
        scale={data.scale}
        total={moments.length}
      />
    </>
  );
};

export default Graphs;
