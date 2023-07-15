import {
  Box, Button, Dialog, FormControlLabel, SvgIcon, Switch, Typography,
} from '@mui/material';
import { Table } from '@tanstack/react-table';
import { isEqual } from 'lodash';
import React, { useMemo, useState } from 'react';
import { MdClear } from 'react-icons/md';
import { useLocation } from 'react-router-dom';
import { PlaylistItem, Track } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { SubtextOptions } from 'components/subtext/Subtext';
import { AppPageViewSettings } from 'types/interfaces';

const viewSettingsMap: Record<string, string> = {
  albums: 'album-view-settings',
  playlists: 'playlist-view-settings',
};

const columnMap: Partial<Record<keyof Track, string>> = {
  duration: 'Duration',
  grandparentTitle: 'Album Artist',
  index: 'Track Number / Index',
  lastViewedAt: 'Last Played',
  originalTitle: 'Track Artist',
  parentTitle: 'Album',
  parentYear: 'Year',
  thumb: 'Artwork',
  userRating: 'Rating',
  viewCount: 'Playcount',
};

const ColumnVisibilityDialog: React.FC<{
  compact: boolean,
  open: boolean,
  ratingOptions: boolean,
  setCompact: React.Dispatch<React.SetStateAction<boolean>>,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  setRatingOptions: React.Dispatch<React.SetStateAction<boolean>>,
  setTitleOptions: React.Dispatch<React.SetStateAction<SubtextOptions>>,
  table: Table<PlaylistItem | Track>,
  titleOptions: SubtextOptions,
}> = ({
  compact,
  open,
  ratingOptions,
  setCompact,
  setOpen,
  setRatingOptions,
  setTitleOptions,
  table,
  titleOptions,
}) => {
  const { pathname } = useLocation();
  const basePath = pathname.slice(1, pathname.lastIndexOf('/'));
  const [saveCount, setSaveCount] = useState(0);
  const visibleColumns = table.getVisibleLeafColumns();
  const currentSettings: AppPageViewSettings = useMemo(() => {
    const columns: Partial<Record<keyof Track, boolean>> = {};
    table.getAllColumns()
      .forEach((column) => {
        columns[column.id as keyof Track] = column.getIsVisible();
      });
    return {
      columns,
      compact,
      multiLineRating: ratingOptions,
      multiLineTitle: titleOptions.showSubtext,
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [compact, ratingOptions, table, titleOptions.showSubtext, visibleColumns]);

  const disabled = useMemo(() => {
    const savedSettings = window.electron.readConfig(viewSettingsMap[basePath]);
    return isEqual(savedSettings, currentSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveCount, currentSettings]);

  return (
    <Dialog
      PaperProps={{
        sx: {
          border: '1px solid var(--mui-palette-border-main)',
        },
      }}
      maxWidth="sm"
      open={open}
      sx={{
        zIndex: 2000,
      }}
      onClose={() => setOpen(false)}
    >
      <SvgIcon
        sx={{
          color: 'text.secondary',
          cursor: 'pointer',
          position: 'absolute',
          right: 16,
          top: 16,
          '&:hover': {
            color: 'text.primary',
          },
        }}
        onClick={() => setOpen(false)}
      >
        <MdClear />
      </SvgIcon>
      <Box
        height="fit-content"
        padding={2}
        width={568}
      >
        <Typography
          color="text.primary"
          fontSize="1.5rem"
          fontWeight={600}
          lineHeight={1.5}
        >
          Columns
        </Typography>
        <Box
          display="flex"
          flexWrap="wrap"
        >
          {table.getAllLeafColumns()
            .filter((column) => !['parentIndex', 'title'].includes(column.id))
            .map((column) => (
              <div key={column.id} style={{ height: 38, width: '50%' }}>
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
                      &nbsp;&nbsp;
                      {columnMap[column.id as keyof Track]}
                    </>
                  )}
                />
              </div>
            ))}
        </Box>
        <Typography
          color="text.primary"
          fontSize="1.5rem"
          fontWeight={600}
          lineHeight={1.5}
          marginTop={1}
        >
          Album View Settings
        </Typography>
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
          Show track artist and album below the track title
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
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
        >
          <div>
            <Typography
              sx={{ fontWeight: 600, lineHeight: '38px' }}
              variant="body1"
            >
              Set as Default
            </Typography>
            <Typography mt={-1} variant="subtitle2">
              Save the current settings for the album page
            </Typography>
          </div>
          <MotionBox
            transition={{ type: 'spring', stiffness: 100 }}
            whileHover={{ scale: disabled ? [null] : [null, 1.08, 1.04] }}
          >
            <Button
              color="primary"
              disabled={disabled}
              size="small"
              sx={{
                borderRadius: '10px',
                fontSize: '0.95rem',
                ml: '4px',
                height: '32px',
                textTransform: 'none',
                '&:hover': {
                  backgroundColor: 'primary.light',
                },
              }}
              variant="contained"
              onClick={() => {
                window.electron.writeConfig(viewSettingsMap[basePath], currentSettings);
                setSaveCount(saveCount + 1);
                setOpen(false);
              }}
            >
              <Box alignItems="center" display="flex" justifyContent="center" width={1}>
                Save
              </Box>
            </Button>
          </MotionBox>
        </Box>
      </Box>
    </Dialog>
  );
};

export default ColumnVisibilityDialog;
