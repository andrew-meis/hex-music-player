import { Box, Button, Portal, Slide, SvgIcon, Typography } from '@mui/material';
import { Column, Table } from '@tanstack/react-table';
import { useAtomValue } from 'jotai';
import { isEqual } from 'lodash';
import React, { useMemo, useRef, useState } from 'react';
import { BiChevronLeft, BiChevronRight } from 'react-icons/bi';
import { PlaylistItem, Track } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { SubtextOptions } from 'components/subtext/Subtext';
import { AppTrackViewSettings } from 'types/interfaces';
import { drawerContainerAtom } from 'ui/footer/drawers/ColumnSettingsDrawer';
import ColumnSwitch from './ColumnSwitch';
import RowSettings from './RowSettings';

const viewSettingsMap: Record<string, string> = {
  album: 'album-view-settings',
  artist: 'artist-tracks-view-settings',
  charts: 'charts-view-settings',
  genre: 'genre-tracks-view-settings',
  playlist: 'playlist-view-settings',
  recent: 'recent-favorites-view-settings',
  similar: 'similar-tracks-view-settings',
  static: 'static-view-settings',
  track: 'track-view-settings',
  tracks: 'tracks-view-settings',
};

const ColumnSettings: React.FC<{
  compact: boolean,
  ratingOptions: boolean,
  setCompact: React.Dispatch<React.SetStateAction<boolean>>,
  setRatingOptions: React.Dispatch<React.SetStateAction<boolean>>,
  setTitleOptions: React.Dispatch<React.SetStateAction<SubtextOptions>>,
  table: Table<Track> | Table<PlaylistItem>,
  tableKey: string,
  titleOptions: SubtextOptions,
  useTrackNumber?: boolean,
}> = ({
  compact,
  ratingOptions,
  setCompact,
  setRatingOptions,
  setTitleOptions,
  table,
  tableKey,
  titleOptions,
  useTrackNumber,
}) => {
  const [index, setIndex] = useState(1);
  const [saveCount, setSaveCount] = useState(0);
  const drawerContainer = useAtomValue(drawerContainerAtom);
  const slideContainer = useRef<HTMLDivElement>(null);
  const visibleColumns = table.getVisibleLeafColumns();
  const currentSettings: AppTrackViewSettings = useMemo(() => {
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
    const savedSettings = window.electron.readConfig(viewSettingsMap[tableKey]);
    return isEqual(savedSettings, currentSettings);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveCount, currentSettings]);

  return (
    <Portal container={drawerContainer}>
      <Box height={1} ref={slideContainer} sx={{ willChange: 'transform' }}>
        <Slide
          appear={false}
          container={slideContainer.current}
          direction="left"
          easing="ease-in-out"
          in={index === 1}
          timeout={300}
        >
          <Box height="calc(100% - 56px)">
            <Box
              alignItems="center"
              borderRadius="4px"
              color="text.primary"
              display="flex"
              justifyContent="space-between"
              paddingY="8px"
              width={1}
            >
              <SvgIcon
                sx={{
                  ml: '5px',
                  transition: 'transform 200ms ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'scale(1.3)',
                  },
                }}
                onClick={() => setIndex(0)}
              >
                <BiChevronLeft />
              </SvgIcon>
              <Typography fontSize="1.5rem" fontWeight={600} mr="8px">Columns</Typography>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              mr={1}
            >
              {(table.getAllLeafColumns() as Column<Track, unknown>[])
                .filter((column) => !['parentId', 'parentIndex', 'parentRatingKey', 'title']
                  .includes(column.id))
                .map((column) => (
                  <ColumnSwitch
                    column={column}
                    compact={compact}
                    key={column.id}
                    useTrackNumber={useTrackNumber}
                  />
                ))}
            </Box>
          </Box>
        </Slide>
        <Slide
          container={slideContainer.current}
          direction="right"
          easing="ease-in-out"
          in={index === 0}
          timeout={300}
        >
          <Box
            height="calc(100% - 56px)"
            left={0}
            position="absolute"
            top={0}
            width={1}
          >
            <Box
              alignItems="center"
              borderRadius="4px"
              color="text.primary"
              display="flex"
              justifyContent="space-between"
              paddingY="8px"
              width={1}
            >
              <Typography fontSize="1.5rem" fontWeight={600} ml="8px">Row Settings</Typography>
              <SvgIcon
                sx={{
                  mr: '5px',
                  transition: 'transform 200ms ease-in-out',
                  '&:hover': {
                    color: 'primary.main',
                    transform: 'scale(1.3)',
                  },
                }}
                onClick={() => setIndex(1)}
              >
                <BiChevronRight />
              </SvgIcon>
            </Box>
            <Box
              display="flex"
              flexDirection="column"
              m="0 16px 0 8px"
            >
              <RowSettings
                compact={compact}
                ratingOptions={ratingOptions}
                setCompact={setCompact}
                setRatingOptions={setRatingOptions}
                setTitleOptions={setTitleOptions}
                table={table}
                titleOptions={titleOptions}
              />
            </Box>
          </Box>
        </Slide>
        <Box
          alignItems="center"
          display="flex"
          justifyContent="space-between"
          m="0 16px 0 8px"
        >
          <span>
            <Typography
              sx={{ fontWeight: 600, lineHeight: '38px' }}
              variant="body1"
            >
              Set as Default
            </Typography>
            <Typography color="text.secondary" mt={-1} variant="subtitle2">
              Only for this view
            </Typography>
          </span>
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
                window.electron.writeConfig(viewSettingsMap[tableKey], currentSettings);
                setSaveCount(saveCount + 1);
              }}
            >
              <Box alignItems="center" display="flex" justifyContent="center" width={1}>
                Save
              </Box>
            </Button>
          </MotionBox>
        </Box>
      </Box>
    </Portal>
  );
};

ColumnSettings.defaultProps = {
  useTrackNumber: false,
};

export default ColumnSettings;
