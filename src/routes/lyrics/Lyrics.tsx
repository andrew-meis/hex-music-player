import { Box, Typography } from '@mui/material';
import { useMemo } from 'react';
import { WIDTH_CALC } from 'constants/measures';
import { useNowPlaying } from 'queries/plex-queries';
import { useLyrics } from 'queries/track-queries';
import RenderSyncedLyrics from './RenderSyncedLyrics';

const timestampToMs = (timestamp: string) => {
  const split = timestamp.split(':') as unknown as number[];
  return (split[0] * 60000) + (split[1] * 1000);
};

const processSyncedLyrics = (syncedLyrics: string) => {
  const processedLyrics = syncedLyrics
    .split('\n')
    .map((lyric) => ({
      line: lyric.slice(10).trim(),
      startOffset: timestampToMs(lyric.slice(1, 9)),
    }));
  return processedLyrics;
};

const processPlainLyrics = (plainLyrics: string, duration: number) => plainLyrics
  .split('\n').map((line) => ({ line, startOffset: duration }));

const Lyrics = () => {
  const { data: nowPlaying } = useNowPlaying();
  const { data: lyricsData } = useLyrics({ track: nowPlaying?.track });

  const syncedLyrics = useMemo(() => {
    if (!lyricsData || !lyricsData.syncedLyrics || !nowPlaying) return undefined;
    return processSyncedLyrics(lyricsData.syncedLyrics);
  }, [lyricsData, nowPlaying]);

  const plainLyrics = useMemo(() => {
    if (!lyricsData || !lyricsData.plainLyrics || !nowPlaying) return undefined;
    return processPlainLyrics(lyricsData.plainLyrics, nowPlaying.track.duration || 0);
  }, [lyricsData, nowPlaying]);

  if (!syncedLyrics && !plainLyrics) {
    return null;
  }

  if (syncedLyrics) {
    return (
      <RenderSyncedLyrics
        nowPlaying={nowPlaying!}
        syncedLyrics={syncedLyrics}
      />
    );
  }

  return (
    <Box
      className="scroll-container"
      height={1}
      overflow="auto"
      width={1}
    >
      <Box
        color="text.primary"
        height="fit-content"
        margin="auto"
        width={WIDTH_CALC}
      >
        {plainLyrics!.map((lyric, index) => (
          <Typography
            fontFamily="TT Commons, sans-serif"
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
            }}
            variant="h4"
          >
            {lyric.line || ''}
            &nbsp;
          </Typography>
        ))}
        <Box height={0.5} width={1} />
      </Box>
    </Box>
  );
};

export default Lyrics;
