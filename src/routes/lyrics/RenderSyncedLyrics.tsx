import { Box, Typography } from '@mui/material';
import { useAtom, useAtomValue } from 'jotai';
import React, { useEffect, useRef, useState } from 'react';
import { PlayQueueItem } from 'api/index';
import { WIDTH_CALC } from 'constants/measures';
import useQueue from 'hooks/useQueue';
import { playbackIsPlayingAtom, playbackProgressAtom, usePlayerContext } from 'root/Player';

const getTextStyle = (playerOffset: number, startOffset: number, nextOffset: number) => {
  if (playerOffset > startOffset && playerOffset < nextOffset) {
    return { color: 'text.primary' };
  }
  if (playerOffset < startOffset) {
    return { color: 'text.secondary' };
  }
  if (playerOffset > nextOffset) {
    return { color: 'action.disabled' };
  }
  return { color: 'text.secondary' };
};

const RenderSyncedLyrics: React.FC<{
  nowPlaying: PlayQueueItem
  syncedLyrics: {
    line: string;
    startOffset: number;
  }[]
}> = ({
  nowPlaying,
  syncedLyrics,
}) => {
  const box = useRef<HTMLDivElement | null>();
  const isPlaying = useAtomValue(playbackIsPlayingAtom);
  const player = usePlayerContext();
  const [{ position }, setPlayerPosition] = useAtom(playbackProgressAtom);
  const [activeLine, setActiveLine] = useState<HTMLSpanElement | null>();
  const { updateTimeline } = useQueue();

  useEffect(() => {
    if (!box.current || !activeLine) {
      return;
    }
    box.current.scrollTo({ top: activeLine.offsetTop - 210, behavior: 'smooth' });
  }, [activeLine]);

  const changePosition = async (newPosition: number) => {
    player.setPosition(newPosition);
    setPlayerPosition((state) => ({ ...state, position: newPosition }));
    if (nowPlaying) {
      await updateTimeline(
        nowPlaying.id,
        isPlaying ? 'playing' : 'paused',
        player.currentPosition(),
        nowPlaying.track,
      );
    }
  };

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
        {syncedLyrics.map((lyric, index, array) => {
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
                  cursor: 'pointer',
                  fontWeight: 600,
                  ...getTextStyle(
                    position,
                    lyric.startOffset,
                    nowPlaying?.track.duration || 0,
                  ),
                  '&:hover': {
                    color: 'text.primary',
                  },
                }}
                variant="h4"
                onClick={() => changePosition(lyric.startOffset)}
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
                cursor: 'pointer',
                fontWeight: 600,
                ...getTextStyle(position, lyric.startOffset, next.startOffset),
                '&:hover': {
                  color: 'text.primary',
                },
              }}
              variant="h4"
              onClick={() => changePosition(lyric.startOffset)}
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

export default RenderSyncedLyrics;
