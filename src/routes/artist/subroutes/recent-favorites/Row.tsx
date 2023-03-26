import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track/TrackRow';
import { selectedStyle, selectBorderRadius, rowStyle } from 'constants/style';
import { RowProps } from './RecentFavorites';

const Row = React.memo(({ context, index, track }: RowProps) => {
  const {
    getFormattedTime,
    handleRowClick,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    selectedRows,
  } = context;
  const playing = nowPlaying?.track.id === track.id;
  const selected = selectedRows.includes(index);
  const selUp = selected && selectedRows.includes(index - 1);
  const selDown = selected && selectedRows.includes(index + 1);

  const handleDoubleClick = async () => {
    await playTracks(items, false, track.key);
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
