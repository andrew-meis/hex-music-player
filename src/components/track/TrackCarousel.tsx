import { Box, ClickAwayListener } from '@mui/material';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { AnimatePresence } from 'framer-motion';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { usePrevious } from 'react-use';
import { Library, PlayQueueItem, Track } from 'api/index';
import TrackMenu from 'components/menus/TrackMenu';
import { MotionBox } from 'components/motion-components/motion-components';
import { tracklistMotion } from 'components/motion-components/motion-variants';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import TrackRow from 'components/track/TrackRow';
import useRowSelection from 'hooks/useRowSelection';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import useTrackMenu from 'hooks/useTrackMenu';
import { DragTypes, PlayActions } from 'types/enums';

interface TrackCarouselProps {
  getFormattedTime: (inMs: number) => string;
  isPlaying: boolean;
  library: Library;
  nowPlaying: PlayQueueItem | undefined;
  tracks: Track[];
  rows: number;
}

const TrackCarousel = ({
  getFormattedTime, isPlaying, library, nowPlaying, tracks, rows,
}: TrackCarouselProps) => {
  const hoverIndex = useRef<number | null>(null);
  const queryClient = useQueryClient();
  const [activeIndex, setActiveIndex] = useState(0);
  const prevIndex = usePrevious(activeIndex);
  const difference = useMemo(() => {
    if (prevIndex) return activeIndex - prevIndex;
    return 1;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);
  const trackPage = tracks
    .slice((activeIndex * rows), (activeIndex * rows + rows));

  const { clearRowSelection, isRowSelected, toggleRowSelection } = useRowSelection();
  const { data: selectedRows } = useQuery(
    ['selected-rows'],
    () => [],
    {
      initialData: [] as number[],
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
    },
  );
  const { drag, dragPreview } = useTrackDragDrop({
    hoverIndex,
    items: tracks || [],
    selectedRows,
    type: DragTypes.TRACK,
  });
  const {
    anchorPoint,
    handleContextMenu,
    menuProps,
    playSwitch,
    selectedTracks,
    toggleMenu,
  } = useTrackMenu({ tracks: tracks || [] });

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, selectedRows]);

  useEffect(() => {
    queryClient.setQueryData(['selected-rows'], []);
  }, [queryClient]);

  const handleDoubleClick = async (key: string) => {
    await playSwitch(PlayActions.PLAY_TRACKS, { tracks, shuffle: false, key });
  };

  const handleMouseEnter = (listIndex: number) => {
    hoverIndex.current = listIndex;
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
          <ClickAwayListener onClickAway={clearRowSelection}>
            <Box
              className="list-box"
              display="flex"
              flexDirection="column"
              height={trackPage.length * 56}
              maxHeight={rows * 56}
              minHeight={tracks.length > rows ? rows * 56 : 0}
              ref={drag}
              onContextMenu={(event) => handleContextMenu(event, hoverIndex.current!)}
              onDragEndCapture={() => {
                clearRowSelection();
                const nodes = document.querySelectorAll('div.track');
                nodes.forEach((node) => node.classList.remove('non-dragged', 'dragged'));
              }}
              onDragStartCapture={() => {
                if (hoverIndex.current === null) {
                  return;
                }
                const nodes = document.querySelectorAll('div.track');
                nodes.forEach((node) => node.classList.add('non-dragged'));
                if (selectedRows.length > 1 && selectedRows.includes(hoverIndex.current)) {
                  const draggedNodes = selectedRows.map((row) => document
                    .querySelector(`div.track[data-item-index='${row}'`));
                  draggedNodes.forEach((node) => node?.classList.add('dragged'));
                } else {
                  const draggedNode = document
                    .querySelector(`div.track[data-item-index='${hoverIndex.current}'`);
                  draggedNode?.classList.add('dragged');
                }
              }}
            >
              {trackPage.map((track, index) => {
                const listIndex = (activeIndex * rows) + index;
                const playing = nowPlaying?.track.id === track.id;
                const selected = isRowSelected(listIndex);
                return (
                  <Box
                    alignItems="center"
                    color="text.secondary"
                    display="flex"
                    height={56}
                    key={track.id}
                    width={1}
                    onMouseEnter={() => handleMouseEnter(listIndex)}
                  >
                    <Box
                      alignItems="center"
                      className={`track ${selected ? 'selected' : ''}`}
                      data-item-index={listIndex}
                      display="flex"
                      height={52}
                      onClick={(event) => toggleRowSelection(listIndex, event)}
                      onDoubleClick={() => handleDoubleClick(track.key)}
                    >
                      <TrackRow
                        getFormattedTime={getFormattedTime}
                        index={listIndex + 1}
                        isPlaying={isPlaying}
                        library={library}
                        options={{ showAlbumTitle: true, showArtwork: true }}
                        playing={playing}
                        track={track}
                      />
                    </Box>
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
