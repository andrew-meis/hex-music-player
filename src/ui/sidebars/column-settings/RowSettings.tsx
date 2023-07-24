import { Box, Typography, Switch } from '@mui/material';
import { Table } from '@tanstack/react-table';
import React from 'react';
import { Track, PlaylistItem } from 'api/index';
import { SubtextOptions } from 'components/subtext/Subtext';

const RowSettings: React.FC<{
  compact: boolean,
  ratingOptions: boolean,
  setCompact: (value: React.SetStateAction<boolean>) => void,
  setRatingOptions: (value: React.SetStateAction<boolean>) => void,
  setTitleOptions: (value: React.SetStateAction<SubtextOptions>) => void,
  table: Table<Track> | Table<PlaylistItem>,
  titleOptions: SubtextOptions,
}> = ({
  compact,
  ratingOptions,
  setCompact,
  setRatingOptions,
  setTitleOptions,
  table,
  titleOptions,
}) => (
  <>
    <Box
      alignItems="center"
      display="flex"
      justifyContent="space-between"
    >
      <Typography sx={{ fontWeight: 600 }} variant="body1">Compact Rows</Typography>
      <Switch
        checked={compact}
        onChange={() => {
          if (!compact) {
            table.getColumn('thumb')?.toggleVisibility(false);
            setTitleOptions({
              ...titleOptions,
              showSubtext: false,
            });
            setRatingOptions(false);
            setCompact(true);
            return;
          }
          setCompact(false);
        }}
      />
    </Box>
    <Box
      alignItems="center"
      display="flex"
      justifyContent="space-between"
    >
      <Typography sx={{ fontWeight: 600 }} variant="body1">Title</Typography>
      <Switch
        checked={titleOptions.showSubtext}
        disabled={compact}
        onChange={() => setTitleOptions({
          ...titleOptions,
          showSubtext: !titleOptions.showSubtext,
        })}
      />
    </Box>
    <Typography mt={-1} variant="subtitle2">
      Show artist / album below the track title
    </Typography>
    <Box
      alignItems="center"
      display="flex"
      justifyContent="space-between"
    >
      <Typography sx={{ fontWeight: 600 }} variant="body1">Rating</Typography>
      <Switch
        checked={ratingOptions}
        disabled={compact}
        onChange={() => setRatingOptions(!ratingOptions)}
      />
    </Box>
    <Typography mt={-1} variant="subtitle2">
      Show playcount below rating stars
    </Typography>
  </>
);

export default RowSettings;
