import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track-row/TrackRow';
import { selectedStyle, selectBorderRadius, rowStyle } from 'constants/style';
import { RowProps } from './Playlist';

const Row = React.memo(({ index, item, context }: RowProps) => {
  const {
    getFormattedTime, handleRowClick, hoverIndex, isPlaying, library,
    nowPlaying, playPlaylistAtTrack, selectedRows,
  } = context;
  const { track } = item;
  const playing = nowPlaying?.track.id === track.id;
  const selected = selectedRows.includes(index);
  const selUp = selected && selectedRows.includes(index - 1);
  const selDown = selected && selectedRows.includes(index + 1);

  const handleDoubleClick = async () => {
    await playPlaylistAtTrack(track, false);
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
        index={index + 1}
        isPlaying={isPlaying}
        library={library}
        options={{ showAlbumTitle: true, showArtwork: true }}
        playing={playing}
        track={track}
      />
    </Box>
  );
});

export default Row;
