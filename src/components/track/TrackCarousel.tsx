import { Box, ClickAwayListener } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { AnimatePresence } from 'framer-motion';
import { Library, PlayQueueItem, Track } from 'hex-plex';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { usePrevious } from 'react-use';
import TrackMenu from 'components/menus/TrackMenu';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import TrackRow from 'components/track/TrackRow';
import { selectedStyle, selectBorderRadius, rowStyle } from 'constants/style';
import { PlayParams } from 'hooks/usePlayback';
import useRowSelect from 'hooks/useRowSelect';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import { DragTypes, PlayActions } from 'types/enums';

interface TrackCarouselProps {
  getFormattedTime: (inMs: number) => string;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
  tracks: Track[];
  rows: number;
}

const TrackCarousel = ({
  getFormattedTime, isPlaying, library, nowPlaying, playSwitch, tracks, rows,
}: TrackCarouselProps) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);
  const trackPage = tracks
    .slice((activeIndex * rows), (activeIndex * rows + rows));

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

  const handleDoubleClick = async (key: string) => {
    await playSwitch(PlayActions.PLAY_TRACKS, { tracks, shuffle: false, key });
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLDivElement>) => {
    const target = event.currentTarget.getAttribute('data-item-index');
    if (!target) {
      return;
    }
    hoverIndex.current = parseInt(target, 10);
  };

  return (
    <>
      <AnimatePresence custom={difference} initial={false} mode="wait">
        <MotionBox
          animate={{ x: 0, opacity: 1 }}
          custom={difference}
          display="flex"
          exit="exit"
          initial="enter"
          key={activeIndex}
          transition={{ duration: 0.2 }}
          variants={tracklistMotion}
        >
          <ClickAwayListener onClickAway={handleClickAway}>
            <Box
              className="list-box"
              display="flex"
              flexDirection="column"
              height={trackPage.length * 56}
              maxHeight={rows * 56}
              minHeight={tracks.length > rows ? rows * 56 : 0}
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
              {trackPage.map((track, index) => {
                const playing = nowPlaying?.track.id === track.id;
                const selected = selectedRows.includes((activeIndex * rows) + index);
                const selUp = selected && selectedRows.includes((activeIndex * rows) + index - 1);
                const selDown = selected && selectedRows.includes((activeIndex * rows) + index + 1);
                return (
                  <Box
                    alignItems="center"
                    className="track-row"
                    color="text.secondary"
                    data-item-index={(activeIndex * rows) + index}
                    display="flex"
                    height={56}
                    key={track.id}
                    sx={selected
                      ? { ...selectedStyle, borderRadius: selectBorderRadius(selUp, selDown) }
                      : { ...rowStyle }}
                    width={1}
                    onClick={(event) => handleRowClick(event, (activeIndex * rows) + index)}
                    onContextMenu={handleContextMenu}
                    onDoubleClick={() => handleDoubleClick(track.key)}
                    onMouseEnter={handleMouseEnter}
                  >
                    <TrackRow
                      getFormattedTime={getFormattedTime}
                      index={(activeIndex * rows) + index + 1}
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
        </MotionBox>
      </AnimatePresence>
      <PaginationDots
        activeIndex={activeIndex}
        array={tracks}
        colLength={rows}
        setActiveIndex={setActiveIndex}
      />
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedTracks}
        {...menuProps}
      />
    </>
  );
};

export default TrackCarousel;
