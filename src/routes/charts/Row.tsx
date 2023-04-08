import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track/TrackRow';
import useRowSelection from 'hooks/useRowSelection';
import { RowProps } from './Charts';

const Row = React.memo(({ context, index, track }: RowProps) => {
  const { isRowSelected, toggleRowSelection } = useRowSelection();
  const {
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playUri,
    uri,
  } = context;

  const playing = nowPlaying?.track.id === track.id;
  const selected = isRowSelected(index);

  const handleDoubleClick = async () => {
    await playUri(uri, false, track.key);
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
      onMouseEnter={handleMouseEnter}
    >
      <Box
        alignItems="center"
        className={`track ${selected ? 'selected' : ''}`}
        data-item-index={index}
        display="flex"
        height={52}
        onClick={(event) => toggleRowSelection(index, event)}
        onDoubleClick={handleDoubleClick}
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
