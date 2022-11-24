import { Track } from 'hex-plex';
import React, { useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { DragActions } from '../types/enums';

const useTrackDragDrop = ({
  hoverIndex,
  selectedRows,
  setSelectedRows,
  tracks,
}: {
  hoverIndex: React.MutableRefObject<number | null>,
  selectedRows: number[],
  setSelectedRows: React.Dispatch<React.SetStateAction<number[]>>,
  tracks: Track[],
}) => {
  const [, drag, dragPreview] = useDrag(() => ({
    type: selectedRows.length > 1 ? DragActions.COPY_TRACKS : DragActions.COPY_TRACK,
    item: () => {
      if (selectedRows.length === 1) {
        return tracks[selectedRows[0]];
      }
      return selectedRows.map((n) => tracks[n]);
    },
  }), [tracks, selectedRows]);

  const handleDragStart = useCallback(() => {
    if (selectedRows.includes(hoverIndex.current!)) {
      return;
    }
    setSelectedRows([hoverIndex.current!]);
  }, [hoverIndex, selectedRows, setSelectedRows]);

  return { drag, dragPreview, handleDragStart };
};

export default useTrackDragDrop;
