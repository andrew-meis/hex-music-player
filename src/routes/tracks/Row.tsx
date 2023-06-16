import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track/TrackRow';
import useRowSelection from 'hooks/useRowSelection';
import { RowProps } from './Tracks';

const Row = React.memo(({ context, index, track }: RowProps) => {
  const { isRowSelected, toggleRowSelection } = useRowSelection();
  const {
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    sort,
    uri,
  } = context;

  const playing = nowPlaying?.track.id === track.id;
  const selected = isRowSelected(index);
  const selectedAbove = isRowSelected(index - 1);
  const selectedBelow = isRowSelected(index + 1);

  const handleDoubleClick = async () => {
    await playUri(uri, false, track.key);
  };

  const handleMouseEnter = () => {
    hoverIndex.current = index;
  };

  return (
    <Box
      alignItems="center"
      className={`track ${selected ? 'selected' : ''}`}
      data-item-index={index}
      data-selected-above={selectedAbove}
      data-selected-below={selectedBelow}
      display="flex"
      height={56}
      sx={{
        transform: 'translateZ(0px)',
      }}
      onClick={(event) => toggleRowSelection(index, event)}
      onDoubleClick={handleDoubleClick}
      onMouseEnter={handleMouseEnter}
    >
      <TrackRow
        getFormattedTime={getFormattedTime}
        isPlaying={isPlaying}
        library={library}
        options={{ metaText: sort.by, showAlbumTitle: true, showArtwork: true }}
        playing={playing}
        track={track}
      />
    </Box>
  );
});

export default Row;
