import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track/TrackRow';
import useRowSelection from 'hooks/useRowSelection';
import { RowProps } from './Album';

const Row = ({ context, index, track }: RowProps) => {
  const { isRowSelected, toggleRowSelection } = useRowSelection();
  const {
    getFormattedTime,
    hoverIndex,
    isPlaying,
    library,
    nowPlaying,
    playAlbumAtTrack,
  } = context;

  const playing = nowPlaying?.track.id === track.id;
  const selected = isRowSelected(index);
  const selectedAbove = isRowSelected(index - 1);
  const selectedBelow = isRowSelected(index + 1);

  const handleDoubleClick = async () => {
    await playAlbumAtTrack(track, false);
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
      onClick={(event) => toggleRowSelection(index, event)}
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
};

export default React.memo(Row);
