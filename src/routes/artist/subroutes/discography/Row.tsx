import { Box } from '@mui/material';
import React from 'react';
import { Album } from 'api/index';
import TrackRow from 'components/track/TrackRow';
import { rowStyle, selectBorderRadius, selectedStyle } from 'constants/style';
import { RowProps } from './Discography';

const Row = React.memo(({ context, index, track }: RowProps) => {
  const {
    getFormattedTime,
    groups,
    handleRowClick,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playAlbumAtTrack,
    selectedRows,
  } = context;
  const { originallyAvailableAt } = groups
    .find((album) => album.guid === track.parentGuid)! as Album;
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
        options={{
          originallyAvailableAt,
          showAlbumTitle: true,
          showArtwork: false,
        }}
        playing={playing}
        track={track}
      />
    </Box>
  );
});

export default Row;
