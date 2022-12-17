import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useEffect, useRef, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useLibrary } from 'queries/app-queries';
import { usePlayerState } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';

interface LyricsContainer {
  Lyrics: Lyrics[];
  size: number;
}

interface Lyrics {
  Line: Line[];
  author: string;
  by: string;
  minLines: number;
  provider: string;
  timed: boolean;
}

interface Line {
  Span: Span[];
  endOffset: number;
  startOffset: number;
}

interface Span {
  endOffset: number;
  startOffset: number;
  text: string;
}

const getTextStyle = (playerOffset: number, startOffset: number, endOffset: number) => {
  if (playerOffset > startOffset && playerOffset < endOffset) {
    return { color: 'text.primary' };
  }
  if (playerOffset < startOffset) {
    return { color: 'text.secondary' };
  }
  if (playerOffset > endOffset) {
    return { color: 'text.disabled' };
  }
  return { color: 'text.secondary' };
};

const LyricsComponent = () => {
  const box = useRef<HTMLDivElement | null>();
  const library = useLibrary();
  const [activeLine, setActiveLine] = useState<HTMLSpanElement | null>();
  const { data: nowPlaying } = useNowPlaying();
  const { data: playerState } = usePlayerState();
  const { data: lyrics } = useQuery(
    ['lyrics', nowPlaying?.id],
    async () => {
      const url = library.api.getAuthenticatedUrl(
        `${nowPlaying?.track.media[0].parts[0].streams[1].key}`,
        {
          format: 'xml',
        },
      );
      const response = await axios.get(url);
      return response.data.MediaContainer as LyricsContainer;
    },
    {
      enabled: !!nowPlaying,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );
  const { width } = useOutletContext() as { width: number };

  useEffect(() => {
    if (!box.current || !activeLine) {
      return;
    }
    box.current.scrollTo({ top: activeLine.offsetTop - 210, behavior: 'smooth' });
  }, [activeLine]);

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
        width={width * 0.89}
      >
        {lyrics?.Lyrics[0].Line.slice(0, -4).map((line, index) => (
          <Typography
            fontFamily="TT Commons"
            // eslint-disable-next-line react/no-array-index-key
            key={index}
            ref={
              playerState.position > line.startOffset && playerState.position < line.endOffset
                ? setActiveLine
                : null
            }
            sx={{
              fontWeight: 600,
              ...getTextStyle(playerState.position, line.startOffset, line.endOffset),
            }}
            variant="h4"
          >
            {line.Span ? line.Span[0].text : ''}
            &nbsp;
          </Typography>
        ))}
        <Box height={0.5} width={1} />
      </Box>
    </Box>
  );
};

export default LyricsComponent;
