import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import ky from 'ky';
import { useEffect, useRef, useState } from 'react';
import { WIDTH_CALC } from 'constants/measures';
import { usePlayPosition } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { QueryKeys } from 'types/enums';

interface LyricsData {
  albumName: string;
  artistName: string;
  duration: number;
  id: number;
  instrumental: boolean;
  isrc: string;
  lang: string;
  name: string;
  plainLyrics: string | null;
  releaseData: string;
  spotifyId: string;
  syncedLyrics: string | null;
}

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

const processLyrics = (data: LyricsData, duration: number) => {
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
  const [activeLine, setActiveLine] = useState<HTMLSpanElement | null>();
  const { data: nowPlaying } = useNowPlaying();
  const { data: playbackPosition } = usePlayPosition();
  const { data: lyrics } = useQuery(
    [QueryKeys.LYRICS, nowPlaying?.id],
    async () => {
      const url = 'https://lrclib.net/api/get';
      try {
        const params = new URLSearchParams();
        params.append('artist_name', nowPlaying?.track.grandparentTitle.toLowerCase() || '');
        params.append('album_name', nowPlaying?.track.parentTitle.toLowerCase() || '');
        params.append('track_name', nowPlaying?.track.title.toLowerCase() || '');
        params
          .append('duration', (Math.floor((nowPlaying?.track.duration || 0) / 1000)).toString());
        const response = await ky(`${url}?${params.toString()}`).json() as LyricsData;
        return processLyrics(response, nowPlaying?.track.duration || 0);
      } catch {
        const params = new URLSearchParams();
        params.append('artist_name', nowPlaying?.track.originalTitle.toLowerCase() || '');
        params.append('album_name', nowPlaying?.track.parentTitle.toLowerCase() || '');
        params.append('track_name', nowPlaying?.track.title.toLowerCase() || '');
        params
          .append('duration', (Math.floor((nowPlaying?.track.duration || 0) / 1000)).toString());
        const response = await ky(`${url}?${params.toString()}`).json() as LyricsData;
        return processLyrics(response, nowPlaying?.track.duration || 0);
      }
    },
    {
      enabled: !!nowPlaying,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );

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
                  playbackPosition.position > lyric.startOffset
                    ? setActiveLine
                    : null
                }
                sx={{
                  fontWeight: 600,
                  ...getTextStyle(
                    playbackPosition.position,
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
                playbackPosition.position > lyric.startOffset
                && playbackPosition.position < next.startOffset
                  ? setActiveLine
                  : null
              }
              sx={{
                fontWeight: 600,
                ...getTextStyle(playbackPosition.position, lyric.startOffset, next.startOffset),
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
