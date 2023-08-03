import { Box, Button, FormHelperText, InputBase, Typography } from '@mui/material';
import { useQueryClient } from '@tanstack/react-query';
import { inPlaceSort } from 'fast-sort';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { useMemo, useState } from 'react';
import { useDropzone, FileWithPath } from 'react-dropzone';
import { Track } from 'api/index';
import { MotionBox } from 'components/motion-components/motion-components';
import { toastAtom } from 'components/toast/Toast';
import { LyricsObject } from 'queries/track-query-fns';
import { settingsAtom } from 'root/Root';
import { QueryKeys } from 'types/enums';

const processLyrics = (lyrics: string) => {
  let lines = lyrics.split(/\r?\n/);
  const regex = /(\[\d\d:\d\d.\d\d\])/g;
  lines = lines.flatMap((line) => {
    const lineSplit = line.split(regex);
    const timestamps = lineSplit.filter((str) => str.match(/(\[\d\d:\d\d.\d\d\])/));
    const lyric = lineSplit.filter((str) => !str.match(/(\[\d\d:\d\d.\d\d\])/))
      .filter((str) => str);
    return timestamps.map((timestamp) => `${timestamp} ${lyric}`);
  });
  return inPlaceSort(lines).asc().join('\n');
};

const Lyrics: React.FC<{
  lyricsData: LyricsObject,
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  track: Track,
}> = ({
  lyricsData,
  setOpen,
  track,
}) => {
  const queryClient = useQueryClient();
  const settings = useAtomValue(settingsAtom);
  const setToast = useSetAtom(toastAtom);
  const [lyricsChanged, setLyricsChanged] = useState(false);
  const [value, setValue] = useState(lyricsData.syncedLyrics || lyricsData.plainLyrics || '');

  const validSyncedLyrics = useMemo(() => value?.split(/\r?\n/)
    .every((line) => line.split(/\[\d\d:\d\d.\d\d\]/).length === 2), [value]);

  const validPlainLyrics = useMemo(() => typeof value === 'string', [value]);

  const { getRootProps, getInputProps, isDragAccept } = useDropzone({
    accept: { '*': ['.*'] },
    noClick: true,
    onDrop: (files: FileWithPath[]) => {
      if (files.length === 0) {
        return;
      }
      if (!['.lrc', '.txt'].includes(files[0].name.slice(-4))) {
        setToast({ type: 'error', text: 'Must upload .txt or .lrc file' });
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', (event) => {
        const newLyrics = processLyrics(event.target!.result as string);
        setValue(newLyrics);
        setLyricsChanged(true);
      });
      reader.readAsText(files[0]);
    },
  });

  const style = useMemo(() => ({
    borderWidth: '1px',
    borderStyle: 'dashed',
    borderColor: isDragAccept ? 'green' : 'var(--mui-palette-border-main)',
  }), [isDragAccept]);

  const sx = useMemo(() => ({
    fontSize: '0.8rem',
    ...(validSyncedLyrics && { color: 'success.main' }),
    ...(!validSyncedLyrics && validPlainLyrics && { color: 'warning.main' }),
  }), [validPlainLyrics, validSyncedLyrics]);

  const text = useMemo(() => {
    if (validSyncedLyrics) return 'Valid synced lyrics';
    if (!validSyncedLyrics && validPlainLyrics) return 'Valid plain lyrics';
    if (!value) return ' ';
    return ' ';
  }, [validPlainLyrics, validSyncedLyrics, value]);

  const handleSave = () => {
    const newLyrics = {
      ...lyricsData,
      ...(validSyncedLyrics && { syncedLyrics: value }),
      ...(!validSyncedLyrics && validPlainLyrics && { plainLyrics: value }),
    };
    window.electron.writeLyrics(newLyrics);
    queryClient.refetchQueries([QueryKeys.LYRICS, track.id]);
    setOpen(false);
  };

  return (
    <Box
      height={496}
      maxWidth={552}
      minWidth={552}
      overflow="hidden"
      paddingX={3}
      paddingY={2}
    >
      <Typography
        color="text.primary"
        fontFamily="TT Commons, sans-serif"
        fontSize="1.625rem"
      >
        Lyrics
      </Typography>
      <Box
        {...getRootProps({ style })}
        border="1px solid var(--mui-palette-border-main)"
        borderRadius="4px"
        className="scroll-container"
        height="calc(100% - 111px)"
        overflow="overlay"
        sx={{
          backgroundImage: 'var(--mui-palette-common-overlay)',
        }}
      >
        <InputBase
          fullWidth
          multiline
          inputProps={{
            ...getInputProps(),
            style: {
              padding: '0 5px',
            },
          }}
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            setLyricsChanged(true);
          }}
        />
      </Box>
      <FormHelperText
        sx={sx}
      >
        {text}
      </FormHelperText>
      <Box
        alignItems="center"
        display="flex"
        height={40}
        justifyContent="flex-end"
      >
        <MotionBox
          transition={{ type: 'spring', stiffness: 100 }}
          whileHover={{ scale: [null, 1.08, 1.04] }}
        >
          <Button
            color="error"
            size="small"
            sx={{
              borderRadius: '10px',
              color: settings.colorMode === 'light' ? 'common.white' : '',
              fontSize: '0.95rem',
              ml: '4px',
              height: '32px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--mui-palette-error-light)',
              },
            }}
            variant="contained"
            onClick={() => setOpen(false)}
          >
            <Box alignItems="center" display="flex" justifyContent="center" width={1}>
              Cancel
            </Box>
          </Button>
        </MotionBox>
        <MotionBox
          transition={{ type: 'spring', stiffness: 100 }}
          whileHover={{ scale: lyricsChanged ? [null, 1.08, 1.04] : [null] }}
        >
          <Button
            color="success"
            disabled={!lyricsChanged}
            size="small"
            sx={{
              borderRadius: '10px',
              color: settings.colorMode === 'light' ? 'common.white' : '',
              fontSize: '0.95rem',
              ml: '4px',
              height: '32px',
              textTransform: 'none',
              '&:hover': {
                backgroundColor: 'var(--mui-palette-success-light)',
              },
            }}
            variant="contained"
            onClick={handleSave}
          >
            <Box alignItems="center" display="flex" justifyContent="center" width={1}>
              Save
            </Box>
          </Button>
        </MotionBox>
      </Box>
    </Box>
  );
};

export default Lyrics;
