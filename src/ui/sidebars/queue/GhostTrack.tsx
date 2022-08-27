import {
  Avatar, Box, ListItem, Typography,
} from '@mui/material';
import React from 'react';
import { Track } from 'hex-plex';
import { useLibrary, useSettings } from '../../../hooks/queryHooks';

interface Props {
  height: number,
  track: Track,
}

const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};

const GhostTrack = ({ height, track }: Props) => {
  const library = useLibrary();
  const { data: settings } = useSettings();
  const { colorMode } = settings;
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
    },
  );
  const subText = `${track.originalTitle
    ? track.originalTitle
    : track.grandparentTitle} — ${track.parentTitle}`;

  return (
    <ListItem
      disablePadding
      sx={{
        height: '56px',
        width: 'auto',
        paddingRight: '5px',
        border: '1px solid transparent',
        pointerEvents: 'none',
        // @ts-ignore
        background: `-webkit-linear-gradient(
          ${colorMode === 'light' ? 'rgba(0, 0, 0, 1)' : 'rgba(255, 255, 255, 1)'}, transparent)`,
        WebkitTextFillColor: 'transparent',
        WebkitBackgroundClip: 'text',
      }}
    >
      <Avatar
        alt={track.title}
        imgProps={{
          sx: {
            WebkitMaskImage: `-webkit-gradient(linear, center top, center bottom,
            color-stop(0.00, rgba(0,0,0,1)), color-stop(${height / 56},  rgba(0,0,0,0)))`,
          },
        }}
        src={thumbSrc}
        sx={{ width: 40, height: 40, marginX: '8px' }}
        variant="rounded"
      />
      <Box
        sx={{
          display: 'table',
          tableLayout: 'fixed',
          width: '100%',
        }}
      >
        <Typography
          color="text.primary"
          fontFamily="Rubik"
          fontSize="0.95rem"
          sx={{ ...typographyStyle }}
        >
          {track.title}
        </Typography>
        <Typography
          color="text.secondary"
          fontFamily="Arimo"
          fontSize="0.875rem"
          sx={{ ...typographyStyle }}
        >
          {subText}
        </Typography>
      </Box>
    </ListItem>
  );
};

export default GhostTrack;
