import { Box, ClickAwayListener } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { Track } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import TrackMenu from 'components/menus/TrackMenu';
import TrackRow from 'components/track-row/TrackRow';
import { selectedStyle, selectBorderRadius, rowStyle } from 'constants/style';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { ArtistContext } from 'routes/artist/Artist';
import { DragTypes } from 'types/enums';

type ContextProps = Pick<
  ArtistContext,
  'getFormattedTime' | 'isPlaying' | 'library' | 'nowPlaying' | 'playSwitch'
>

interface TrackHighlightsProps {
  activeIndex: number;
  context: ContextProps | undefined;
  tracks: Track[];
}

// TODO double-click behavior
const TrackHighlights = React.memo(({
  activeIndex, context, tracks: allTracks = [],
}: TrackHighlightsProps) => {
  const tracks = allTracks.slice((activeIndex * 4), (activeIndex * 4 + 4));
  const { getFormattedTime, isPlaying, library, nowPlaying, playSwitch } = context!;
  const hoverIndex = useRef<number | null>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);
  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    items: tracks || [],
    selectedRows,
    type: DragTypes.TRACK,
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const selectedTracks = useMemo(() => {
    if (!tracks) {
      return undefined;
    }
    if (selectedRows.length > 0) {
      return selectedRows.map((n) => tracks[n]);
    }
    return undefined;
  }, [selectedRows, tracks]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-item-index');
    if (!target) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    switch (true) {
      case selectedRows.length === 0:
        setSelectedRows([targetIndex]);
        break;
      case selectedRows.length === 1 && !selectedRows.includes(targetIndex):
        setSelectedRows([targetIndex]);
        break;
      case selectedRows.length > 1 && !selectedRows.includes(targetIndex):
        setSelectedRows([targetIndex]);
        break;
      default:
        break;
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget.getAttribute('data-item-index');
    if (!target) {
      return;
    }
    hoverIndex.current = parseInt(target, 10);
  };

  if (!tracks) {
    return null;
  }

  return (
    <>
      <Box
        className="list-box"
        display="flex"
        flex="0 0 100%"
        flexDirection="column"
        height={tracks.length * 56}
        maxHeight={224}
        minHeight={allTracks.length > 4 ? 224 : 0}
        ref={drag}
        onDragEndCapture={() => {
          document.querySelectorAll('div.track-row')
            .forEach((node) => node.classList.remove('non-dragged-track', 'dragged-track'));
          handleClickAway();
        }}
        onDragStartCapture={() => {
          if (hoverIndex.current === null) {
            return;
          }
          document.querySelectorAll('div.track-row')
            .forEach((node) => node.classList.add('non-dragged-track'));
          if (selectedRows.length > 1 && selectedRows.includes(hoverIndex.current)) {
            const draggedNodes = selectedRows.map((row) => document
              .querySelector(`div.track-row[data-item-index='${row}'`));
            draggedNodes
              .forEach((node) => node?.classList.add('dragged-track'));
          } else {
            const draggedNode = document
              .querySelector(`div.track-row[data-item-index='${hoverIndex.current}'`);
            draggedNode?.classList.add('dragged-track');
          }
        }}
      >
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box
            display="flex"
            flexDirection="column"
            flexWrap="wrap"
            maxHeight="100%"
          >
            {tracks.map((track, index) => {
              const playing = nowPlaying?.track.id === track.id;
              const selected = selectedRows.includes(index);
              const selUp = selected && selectedRows.includes(index - 1);
              const selDown = selected && selectedRows.includes(index + 1);
              return (
                <Box
                  alignItems="center"
                  className="track-row"
                  color="text.secondary"
                  data-item-index={index}
                  display="flex"
                  height={56}
                  key={track.id}
                  sx={selected
                    ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
                    : { ...rowStyle }}
                  width={1}
                  onClick={(event) => handleRowClick(event, index)}
                  onContextMenu={handleContextMenu}
                  onMouseEnter={handleMouseEnter}
                >
                  <TrackRow
                    getFormattedTime={getFormattedTime}
                    index={(activeIndex * 4) + index + 1}
                    isPlaying={isPlaying}
                    library={library}
                    options={{ showAlbumTitle: true, showArtwork: true }}
                    playing={playing}
                    track={track}
                  />
                </Box>
              );
            })}
          </Box>
        </ClickAwayListener>
      </Box>
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedTracks}
        {...menuProps}
      />
    </>
  );
});

export default TrackHighlights;
