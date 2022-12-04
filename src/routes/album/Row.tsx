import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track-row/TrackRow';
import { RowProps } from './Album';
import 'styles/track.scss';

const itemStyle = {
  borderRadius: '4px',
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
    backgroundColor: 'action.hover',
  },
};

const selectBorderRadius = (selUp: boolean, selDown: boolean) => {
  if (selUp && selDown) {
    return '0';
  }
  if (selUp) {
    return '0 0 4px 4px';
  }
  if (selDown) {
    return '4px 4px 0 0';
  }
  return '4px';
};

const selectedStyle = {
  ...itemStyle,
  backgroundColor: 'action.selected',
  color: 'text.primary',
  '&:hover': {
    backgroundColor: 'action.selected',
  },
};

const Row = React.memo(({ context, index, track }: RowProps) => {
  const {
    getFormattedTime, handleRowClick, hoverIndex, isPlaying, library,
    nowPlaying, playAlbumAtTrack, selectedRows,
  } = context;
  const playing = nowPlaying?.track.id === track.id;
  const selected = selectedRows.includes(index);
  const selUp = selected && selectedRows.includes(index - 1);
  const selDown = selected && selectedRows.includes(index + 1);

  const handleDoubleClick = async () => {
    await playAlbumAtTrack(track, false);
  };

  const handleMouseEnter = () => {
    hoverIndex.current = index;
  };

  return (
    <Box
      alignItems="center"
      className="track-row"
      color="text.secondary"
      display="flex"
      height={56}
      sx={selected
        ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
        : { ...itemStyle }}
      onClick={(event) => handleRowClick(event, index)}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
    >
      <TrackRow
        getFormattedTime={getFormattedTime}
        index={track.trackNumber}
        isPlaying={isPlaying}
        library={library}
        options={{ showAlbumTitle: false, showArtwork: false }}
        playing={playing}
        track={track}
      />
    </Box>
  );
});

export default Row;
