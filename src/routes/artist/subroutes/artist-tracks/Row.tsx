import { Box } from '@mui/material';
import React from 'react';
import TrackRow from 'components/track/TrackRow';
import useRowSelection from 'hooks/useRowSelection';
import { RowProps } from './ArtistTracks';

const Row = React.memo(({ context, index, track }: RowProps) => {
  const { isRowSelected, toggleRowSelection } = useRowSelection();
  const {
    albums,
    getFormattedTime,
    hoverIndex,
    isPlaying,
    items,
    library,
    nowPlaying,
    playTracks,
    sort,
  } = context;

  const { originallyAvailableAt } = albums.find((album) => album.guid === track.parentGuid)!;
  const playing = nowPlaying?.track.id === track.id;
  const selected = isRowSelected(index);
  const selectedAbove = isRowSelected(index - 1);
  const selectedBelow = isRowSelected(index + 1);

  const handleDoubleClick = async () => {
    await playTracks(items, false, track.key);
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
        index={index + 1}
        isPlaying={isPlaying}
        library={library}
        options={{
          metaText: sort.by,
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
