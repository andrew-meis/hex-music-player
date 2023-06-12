import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Playlist, Library } from 'api/index';
import PlaylistMenu from 'components/menus/PlaylistMenu';
import { VIEW_PADDING } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { getColumnsWide } from 'scripts/get-columns';
import PlaylistCard from './PlaylistCard';

interface PlaylistCarouselProps {
  library: Library;
  navigate: NavigateFunction;
  playlists: Playlist[];
  width: number;
}

const PlaylistCarousel = ({
  library, navigate, playlists, width,
}: PlaylistCarouselProps) => {
  const [menuTarget, setMenuTarget] = useState<Playlist[]>([]);
  const { playSwitch } = usePlayback();

  const throttledCols = throttle(() => getColumnsWide(width), 300, { leading: true });
  const { cols } = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const playlistPage = playlists.slice(0, cols);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(playlists
      .filter((playlist) => playlist)
      .filter((playlist) => playlist.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [playlists, toggleMenu]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
    ROW_HEIGHT: 128,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
  }), [cols, width]);

  return (
    <>
      <Box
        display="flex"
        gap="8px"
        height={measurements.ROW_HEIGHT}
      >
        {playlistPage.map((playlist) => (
          <PlaylistCard
            handleContextMenu={handleContextMenu}
            id={playlist.id}
            key={playlist.id}
            library={library}
            measurements={measurements}
            menuTarget={menuTarget}
            navigate={navigate}
          />
        ))}
      </Box>
      <PlaylistMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        playlists={menuTarget}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
          setMenuTarget([]);
        }}
        {...menuProps}
      />
    </>
  );
};

export default PlaylistCarousel;
