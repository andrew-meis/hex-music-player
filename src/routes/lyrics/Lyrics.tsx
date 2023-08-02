import { Box, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import { useEffect, useMemo, useRef, useState } from 'react';
import { WIDTH_CALC } from 'constants/measures';
import { useNowPlaying } from 'queries/plex-queries';
import { useLyrics } from 'queries/track-queries';
import { LyricsObject } from 'queries/track-query-fns';
import { playbackProgressAtom } from 'root/Player';

const getTextStyle = (playerOffset: number, startOffset: number, nextOffset: number) => {
  if (playerOffset > startOffset && playerOffset < nextOffset) {
    return { color: 'text.primary' };
  }
  if (playerOffset < startOffset) {
    return { color: 'text.secondary' };
  }
  if (playerOffset > nextOffset) {
    return { color: 'text.disabled' };
  }
  return { color: 'text.secondary' };
};

const timestampToMs = (timestamp: string) => {
  const split = timestamp.split(':') as unknown as number[];
  return (split[0] * 60000) + (split[1] * 1000);
};

const processLyrics = (data: LyricsObject, duration: number) => {
  if (data.syncedLyrics) {
    const syncedLyrics = data.syncedLyrics
      .split('\n')
      .map((lyric) => ({
        line: lyric.slice(11),
        startOffset: timestampToMs(lyric.slice(1, 9)),
      }));
    return syncedLyrics;
  }
  if (data.plainLyrics) {
    return data.plainLyrics.split('\n').map((line) => ({ line, startOffset: duration }));
  }
  return [{
    line: 'No lyrics found.',
    startOffset: duration,
  }];
};

const Lyrics = () => {
  const box = useRef<HTMLDivElement | null>();
  const { position } = useAtomValue(playbackProgressAtom);
  const [activeLine, setActiveLine] = useState<HTMLSpanElement | null>();
  const { data: nowPlaying } = useNowPlaying();
  const { data: lyricsData } = useLyrics({ track: nowPlaying?.track });

  const lyrics = useMemo(() => {
    if (!lyricsData || !nowPlaying) return undefined;
    return processLyrics(lyricsData, nowPlaying.track.duration || 0);
  }, [lyricsData, nowPlaying]);

  useEffect(() => {
    if (!box.current || !activeLine) {
      return;
    }
    box.current.scrollTo({ top: activeLine.offsetTop - 210, behavior: 'smooth' });
  }, [activeLine]);

  if (!lyrics) {
    return null;
  }

  return (
    <Box
      className="scroll-container"
      height={1}
      overflow="auto"
      ref={box}
      width={1}
    >
      <Box
        color="text.primary"
        height="fit-content"
        margin="auto"
        width={WIDTH_CALC}
      >
        {lyrics.map((lyric, index, array) => {
          const next = array[index + 1];
          if (!next) {
            return (
              <Typography
                fontFamily="TT Commons, sans-serif"
                // eslint-disable-next-line react/no-array-index-key
                key={index}
                ref={
                  position > lyric.startOffset
                    ? setActiveLine
                    : null
                }
                sx={{
                  fontWeight: 600,
                  ...getTextStyle(
                    position,
                    lyric.startOffset,
                    nowPlaying?.track.duration || 0,
                  ),
                }}
                variant="h4"
              >
                {lyric.line || ''}
                &nbsp;
              </Typography>
            );
          }
          return (
            <Typography
              fontFamily="TT Commons, sans-serif"
              // eslint-disable-next-line react/no-array-index-key
              key={index}
              ref={
                position > lyric.startOffset
                && position < next.startOffset
                  ? setActiveLine
                  : null
              }
              sx={{
                fontWeight: 600,
                ...getTextStyle(position, lyric.startOffset, next.startOffset),
              }}
              variant="h4"
            >
              {lyric.line || ''}
              &nbsp;
            </Typography>
          );
        })}
        <Box height={0.5} width={1} />
      </Box>
    </Box>
  );
};

export default Lyrics;
