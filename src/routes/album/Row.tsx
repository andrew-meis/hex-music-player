import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track/TrackRow';
import { rowStyle, selectBorderRadius, selectedStyle } from 'constants/style';
import { RowProps } from './Album';

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
      color="text.secondary"
      display="flex"
      height={56}
      sx={selected
        ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
        : { ...rowStyle }}
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
