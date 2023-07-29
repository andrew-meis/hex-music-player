import { FormControlLabel, Switch } from '@mui/material';
import { Column } from '@tanstack/react-table';
import React from 'react';
import { Track } from 'api/index';

const columnMap: Partial<Record<keyof Track, string>> = {
  duration: 'Duration',
  grandparentTitle: 'Album Artist',
  index: 'Index',
  lastViewedAt: 'Last Played',
  originallyAvailableAt: 'Release Date',
  originalTitle: 'Track Artist',
  parentTitle: 'Album',
  parentYear: 'Year',
  ratingCount: 'Popularity',
  thumb: 'Artwork',
  userRating: 'Rating',
  viewCount: 'Playcount',
};

const ColumnSwitch: React.FC<{
  column: Column<Track, unknown>,
  compact: boolean,
  useTrackNumber?: boolean,
}> = ({
  column,
  compact,
  useTrackNumber,
}) => (
  <div style={{ height: 38, width: '100%' }}>
    <FormControlLabel
      control={(
        <Switch
          checked={column.getIsVisible()}
          disabled={column.id === 'thumb' && compact}
          onChange={column.getToggleVisibilityHandler()}
        />
      )}
      label={(
        <>
          {useTrackNumber && column.id === 'index'
            ? 'Track Number'
            : columnMap[column.id as keyof Track]}
        </>
      )}
      labelPlacement="start"
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        marginX: 1,
      }}
    />
  </div>
);

ColumnSwitch.defaultProps = {
  useTrackNumber: false,
};

export default ColumnSwitch;
