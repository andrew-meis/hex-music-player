import { useMenuState } from '@szhsin/react-menu';
import React, { useState, useCallback, useMemo } from 'react';
import { Track } from 'api/index';
import usePlayback from './usePlayback';
import useRowSelection from './useRowSelection';

const useTrackMenu = ({ tracks }: { tracks: Track[] }) => {
  const { toggleRowSelection, getAllSelections } = useRowSelection();

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();
  const { playSwitch } = usePlayback();

  const handleContextMenu = useCallback((
    event: React.MouseEvent<HTMLDivElement>,
    index: number,
  ) => {
    event.preventDefault();
    const selections = getAllSelections();
    switch (true) {
      case selections.length === 0:
        toggleRowSelection(index, event);
        break;
      case selections.length === 1 && !selections.includes(index):
        toggleRowSelection(index, event);
        break;
      case selections.length > 1 && !selections.includes(index):
        toggleRowSelection(index, event);
        break;
      default:
        break;
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [getAllSelections, toggleMenu, toggleRowSelection]);

  const selectedTracks = useMemo(() => {
    if (!tracks) {
      return undefined;
    }
    const selections = getAllSelections();
    if (selections.length > 0) {
      return selections.map((n) => tracks[n]).filter((track) => track);
    }
    return undefined;
  }, [getAllSelections, tracks]);

  return {
    anchorPoint,
    handleContextMenu,
    menuProps,
    playSwitch,
    selectedTracks,
    toggleMenu,
  };
};

export default useTrackMenu;
