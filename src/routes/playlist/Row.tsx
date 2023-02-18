import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import React, { useState } from 'react';
import TrackRow from 'components/track-row/TrackRow';
import { selectedStyle, selectBorderRadius, rowStyle } from 'constants/style';
import { RowProps } from './Playlist';

const Row = React.memo(({ index, item, context }: RowProps) => {
  const [over, setOver] = useState(false);
  const {
    dropIndex,
    getFormattedTime,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playPlaylistAtTrack,
    selectedRows,
  } = context;
  const { track } = item;
  const { data: isDragging } = useQuery(
    ['is-dragging'],
    () => false,
  );

  const playing = nowPlaying?.track.id === track.id;
  const selected = selectedRows.includes(index);
  const selUp = selected && selectedRows.includes(index - 1);
  const selDown = selected && selectedRows.includes(index + 1);

  const handleDoubleClick = async () => {
    await playPlaylistAtTrack(track, false);
  };

  const handleDrop = () => {
    dropIndex.current = index;
    setOver(false);
  };

  const handleMouseEnter = () => {
    hoverIndex.current = index;
  };

  return (
    <Box
      alignItems="center"
      className={over ? 'playlist-track playlist-track-over' : 'playlist-track'}
      color="text.secondary"
      data-index={index}
      display="flex"
      height={56}
      sx={selected
        ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
        : { ...rowStyle }}
      onClick={(event) => handleRowClick(event, index)}
      onDoubleClick={handleDoubleClick}
      onDragEnter={() => setOver(true)}
      onDragLeave={() => setOver(false)}
      onDrop={handleDrop}
      onMouseEnter={handleMouseEnter}
    >
      <Box
        alignItems="center"
        display="flex"
        sx={{ pointerEvents: isDragging ? 'none' : '' }}
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
    </Box>
  );
});

export default Row;
