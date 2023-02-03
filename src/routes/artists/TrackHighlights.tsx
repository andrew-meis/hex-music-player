import { Box, ClickAwayListener } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { Track } from 'hex-plex';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import TrackMenu from 'components/track-menu/TrackMenu';
import TrackRow from 'components/track-row/TrackRow';
import { ButtonSpecs } from 'constants/buttons';
import { selectedStyle, selectBorderRadius, rowStyle } from 'constants/style';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { ArtistsContext } from './Artists';

interface TrackHighlightsProps {
  context: ArtistsContext | undefined;
  tracks: Track[] | undefined;
}

// TODO double-click behavior
const TrackHighlights = React.memo(({ context, tracks }: TrackHighlightsProps) => {
  const { getFormattedTime, isPlaying, library, nowPlaying, playSwitch } = context!;
  const hoverIndex = useRef<number | null>(null);
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);
  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    selectedRows,
    tracks: tracks || [],
  });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const getTrackId = useCallback(() => {
    if (!tracks) {
      return 0;
    }
    if (selectedRows.length === 1) {
      return tracks[selectedRows[0]].id;
    }
    return 0;
  }, [selectedRows, tracks]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-item-index');
    if (!target) {
      return;
    }
    const targetIndex = parseInt(target, 10);
    if (selectedRows.length === 0) {
      setSelectedRows([targetIndex]);
    }
    if (selectedRows.length === 1 && selectedRows.includes(targetIndex)) {
      // pass
    }
    if (selectedRows.length === 1 && !selectedRows.includes(targetIndex)) {
      setSelectedRows([targetIndex]);
    }
    if (selectedRows.length > 1 && selectedRows.includes(targetIndex)) {
      // pass
    }
    if (selectedRows.length > 1 && !selectedRows.includes(targetIndex)) {
      setSelectedRows([targetIndex]);
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedRows, setSelectedRows, toggleMenu]);

  const handleMenuSelection = async (button: ButtonSpecs) => {
    if (!tracks) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => tracks[n]);
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const selectedTracks = selectedRows.map((n) => tracks[n]);
      await playSwitch(button.action, { tracks: selectedTracks, shuffle: button.shuffle });
    }
  };

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
        flexDirection="column"
        height={tracks.length * 56}
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
          <Box>
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
                  onClick={(event) => handleRowClick(event, index)}
                  onContextMenu={handleContextMenu}
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
            })}
          </Box>
        </ClickAwayListener>
      </Box>
      <TrackMenu
        anchorPoint={anchorPoint}
        handleMenuSelection={handleMenuSelection}
        id={getTrackId()}
        menuProps={menuProps}
        selectedRows={selectedRows}
        toggleMenu={toggleMenu}
      />
    </>
  );
});

export default TrackHighlights;
