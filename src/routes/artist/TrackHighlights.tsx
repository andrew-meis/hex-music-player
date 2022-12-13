import { Box, ClickAwayListener } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import { Track } from 'hex-plex';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import TrackRow from 'components/track-row/TrackRow';
import useMenuStyle from 'hooks/useMenuStyle';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../constants/buttons';
import { ArtistContext } from './Artist';
import { SimilarArtistContext } from './similar-artists/SimilarArtists';

const itemStyle = {
  borderRadius: '4px',
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
    backgroundColor: 'action.hover',
  },
};

const selectBorderRadius = (selUp: boolean, selDown: boolean) => {
  if (selUp && selDown) {
    return '0';
  }
  if (selUp) {
    return '0 0 4px 4px';
  }
  if (selDown) {
    return '4px 4px 0 0';
  }
  return '4px';
};

const selectedStyle = {
  ...itemStyle,
  backgroundColor: 'action.selected',
  color: 'text.primary',
  '&:hover': {
    backgroundColor: 'action.selected',
  },
};

interface TrackHighlightsProps {
  context: ArtistContext | SimilarArtistContext | undefined;
  tracks: Track[] | undefined;
}

// TODO double-click behavior
const TrackHighlights = React.memo(({ context, tracks }: TrackHighlightsProps) => {
  const { getFormattedTime, isPlaying, library, nowPlaying, playSwitch } = context!;
  const hoverIndex = useRef<number | null>(null);
  const menuStyle = useMenuStyle();
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
        onDragEndCapture={handleClickAway}
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
                  color="text.secondary"
                  data-item-index={index}
                  display="flex"
                  height={56}
                  key={track.id}
                  sx={selected
                    ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
                    : { ...itemStyle }}
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
      <ControlledMenu
        {...menuProps}
        portal
        anchorPoint={anchorPoint}
        menuStyle={menuStyle}
        onClose={() => toggleMenu(false)}
      >
        {selectedRows.length === 1 && trackButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
        {selectedRows.length > 1 && tracksButtons.map((button: ButtonSpecs) => (
          <MenuItem key={button.name} onClick={() => handleMenuSelection(button)}>
            {button.icon}
            {button.name}
          </MenuItem>
        ))}
      </ControlledMenu>
    </>
  );
});

export default TrackHighlights;
