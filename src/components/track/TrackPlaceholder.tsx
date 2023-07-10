/* eslint-disable react/no-array-index-key */
import { Skeleton, SkeletonProps } from '@mui/material';
import { Column } from '@tanstack/react-table';
import React from 'react';
import { Track } from 'api/index';
import styles from './TrackTable.module.scss';

const skeletonPropsMap: Partial<Record<keyof Track, Partial<SkeletonProps>[]>> = {
  duration: [{ sx: { ml: 'auto' }, variant: 'text', width: 50 }],
  grandparentTitle: [{ variant: 'text', width: '50%' }],
  index: [{ sx: { display: 'none' } }],
  lastViewedAt: [{ variant: 'text', width: 88 }],
  originalTitle: [{ variant: 'text', width: '70%' }],
  parentIndex: [{ sx: { display: 'none' } }],
  parentTitle: [{ variant: 'text', width: '50%' }],
  parentYear: [{ variant: 'text', width: 40 }],
  thumb: [{ height: 40, sx: { margin: 'auto' }, variant: 'rounded', width: 40 }],
  title: [
    { variant: 'text', width: '50%' },
    { variant: 'text', width: '40%' },
  ],
  userRating: [
    { sx: { ml: 'auto' }, variant: 'text', width: 75 },
    { sx: { ml: 'auto' }, variant: 'text', width: 60 },
  ],
  viewCount: [{ variant: 'text', width: 64 }],
};

const TrackPlaceholder: React.FC<{
  columns: Column<Track, unknown>[],
  compact: boolean,
  isGrouped: boolean,
  singleLineRating: boolean,
  singleLineTitle: boolean,
}> = ({ columns, compact, isGrouped, singleLineRating, singleLineTitle }) => {
  if (isGrouped) {
    return (
      <tr style={{ height: compact ? 40 : 56, pointerEvents: 'none' }}>
        <td colSpan={100}>
          <Skeleton sx={{ marginLeft: '16px' }} variant="text" width="10%" />
        </td>
      </tr>
    );
  }
  return (
    <tr className={styles.row} style={{ height: compact ? 40 : 56, pointerEvents: 'none' }}>
      {columns.map((column) => {
        if (
          ((column.id === 'title' || column.id === 'userRating') && compact)
          || (column.id === 'title' && singleLineTitle)
          || (column.id === 'userRating' && singleLineRating)
        ) {
          return (
            <td key={column.id}>
              <Skeleton {...skeletonPropsMap[column.id as keyof Track]![0]} />
            </td>
          );
        }
        return (
          <td key={column.id}>
            {skeletonPropsMap[column.id as keyof Track]?.map((props, index) => (
              <Skeleton key={index} {...props} />
            ))}
          </td>
        );
      })}
    </tr>
  );
};

export default TrackPlaceholder;
