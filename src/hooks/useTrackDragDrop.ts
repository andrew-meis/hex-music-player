import { Track } from 'hex-plex';
import React from 'react';
import { useDrag } from 'react-dnd';
import { DragActions } from '../types/enums';

const useTrackDragDrop = ({
  hoverIndex,
  selectedRows,
  tracks,
}: {
  hoverIndex: React.MutableRefObject<number | null>,
  selectedRows: number[],
  tracks: Track[],
}) => {
  const [, drag, dragPreview] = useDrag(() => ({
    type: selectedRows.length > 1 ? DragActions.COPY_TRACKS : DragActions.COPY_TRACK,
    item: () => {
      if (!selectedRows.includes(hoverIndex.current!)) {
        return tracks[hoverIndex.current!];
      }
      return selectedRows.map((n) => tracks[n]);
    },
  }), [hoverIndex, tracks, selectedRows]);

  return { drag, dragPreview };
};

export default useTrackDragDrop;
