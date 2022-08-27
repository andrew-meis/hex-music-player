import { Avatar, Box, Tooltip, Typography } from '@mui/material';
import { Track } from 'hex-plex';
import React from 'react';
import { useCurrentQueue, useLibrary } from '../../../hooks/queryHooks';

const Text = ({ track }: { track: Track }) => (
  <Typography color="text.primary" textAlign="center">
    {`${track.originalTitle || track.grandparentTitle} — ${track.title}`}
  </Typography>
);

const CompactQueue = () => {
  const library = useLibrary();
  const { data: playQueue } = useCurrentQueue();
  const items = playQueue?.items
    .slice(playQueue.items.findIndex((item) => item.id === playQueue.selectedItemId) + 1);
  if (!items) {
    return null;
  }
  return (
    <Box display="flex" flexDirection="column">
      {items.map((item) => (
        <Tooltip
          arrow
          key={item.id}
          placement="left"
          title={<Text track={item.track} />}
        >
          <Avatar
            alt={item.track.title}
            src={library.api.getAuthenticatedUrl(
              '/photo/:/transcode',
              {
                url: item.track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
              },
            )}
            sx={{ width: 40, height: 40, marginBottom: '6px', marginLeft: '4px' }}
            variant="rounded"
          />
        </Tooltip>
      ))}
    </Box>
  );
};

export default CompactQueue;
