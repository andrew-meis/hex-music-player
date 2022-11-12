import { Box, ClickAwayListener, Typography } from '@mui/material';
import { ControlledMenu, MenuItem, useMenuState } from '@szhsin/react-menu';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import TrackRow from '../../../components/track-row/TrackRow';
import { ButtonSpecs, trackButtons, tracksButtons } from '../../../constants/buttons';
import useMenuStyle from '../../../hooks/useMenuStyle';
import useRowSelect from '../../../hooks/useRowSelect';
import { DragActions } from '../../../types/enums';
import { ArtistContext } from '../Artist';

const itemStyle = {
  borderRadius: '4px',
  color: 'text.secondary',
  '&:hover': {
    color: 'text.primary',
    backgroundColor: 'action.hover',
  },
};

const previewOptions = {
  offsetX: -8,
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

// TODO double-click behavior
const TopTracks = React.memo(({ context }: { context: ArtistContext | undefined }) => {
  const { getFormattedTime, isPlaying, library, nowPlaying, playSwitch, topTracks } = context!;
  const hoverIndex = useRef<number | null>(null);
  const menuStyle = useMenuStyle();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { selectedRows, setSelectedRows, handleClickAway, handleRowClick } = useRowSelect([]);

  const [, drag, dragPreview] = useDrag(() => ({
    previewOptions,
    type: selectedRows.length > 1 ? DragActions.COPY_TRACKS : DragActions.COPY_TRACK,
    item: () => {
      if (selectedRows.length === 1) {
        return topTracks![selectedRows[0]];
      }
      return selectedRows.map((n) => topTracks![n]);
    },
  }), [topTracks, selectedRows]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  const handleDragStart = useCallback(() => {
    if (selectedRows.includes(hoverIndex.current!)) {
      return;
    }
    setSelectedRows([hoverIndex.current!]);
  }, [selectedRows, setSelectedRows]);

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-index');
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
    if (!topTracks) {
      return;
    }
    if (selectedRows.length === 1) {
      const [track] = selectedRows.map((n) => topTracks[n]);
      await playSwitch(button.action, { track, shuffle: button.shuffle });
      return;
    }
    if (selectedRows.length > 1) {
      const tracks = selectedRows.map((n) => topTracks[n]);
      await playSwitch(button.action, { tracks, shuffle: button.shuffle });
    }
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget.getAttribute('data-index');
    if (!target) {
      return;
    }
    hoverIndex.current = parseInt(target, 10);
  };

  if (!topTracks) {
    return null;
  }

  return (
    <>
      <Box
        className="list-box"
        display="flex"
        flex="50000 0 598px"
        flexDirection="column"
        height={(topTracks.length * 56) + 45}
        mr="8px"
        ref={drag}
        onDragStartCapture={handleDragStart}
      >
        <Box bgcolor="background.paper" color="text.primary">
          <Typography fontFamily="TT Commons" fontSize="1.625rem" pt="6px">
            Top Tracks
          </Typography>
        </Box>
        <ClickAwayListener onClickAway={handleClickAway}>
          <Box>
            {topTracks.map((track, index) => {
              const playing = nowPlaying?.track.id === track.id;
              const selected = selectedRows.includes(index);
              const selUp = selected && selectedRows.includes(index - 1);
              const selDown = selected && selectedRows.includes(index + 1);
              return (
                <Box
                  alignItems="center"
                  color="text.secondary"
                  data-index={index}
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

export default TopTracks;
