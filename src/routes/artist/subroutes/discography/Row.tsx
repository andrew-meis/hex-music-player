import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track-row/TrackRow';
import { rowStyle, selectBorderRadius, selectedStyle } from 'constants/style';
import { RowProps } from './Discography';

const Row = React.memo(({ context, index, track }: RowProps) => {
  const {
    albums,
    getFormattedTime,
    handleRowClick,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    selectedRows,
    sort,
  } = context;
  const { originallyAvailableAt } = albums.find((album) => album.guid === track.parentGuid)!;
  const playing = nowPlaying?.track.id === track.id;
  const selected = selectedRows.includes(index);
  const selUp = selected && selectedRows.includes(index - 1);
  const selDown = selected && selectedRows.includes(index + 1);
  const [by] = sort.split(':');

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
        options={{
          metaText: by,
          originallyAvailableAt,
          showAlbumTitle: true,
          showArtwork: true,
        }}
        playing={playing}
        track={track}
      />
    </Box>
  );
});

export default Row;
