/* eslint-disable react/jsx-no-undef */
import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Album, Library } from 'api/index';
import { AlbumMenu } from 'components/menus';
import { VIEW_PADDING } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useSettings } from 'queries/app-queries';
import { getColumns } from 'scripts/get-columns';
import AlbumCard from './AlbumCard';
import AlbumCardNoText from './AlbumCardNoText';

interface AlbumCarouselProps {
  albums: Album[];
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const AlbumCarousel = ({
  albums, library, navigate, width,
}: AlbumCarouselProps) => {
  const [menuTarget, setMenuTarget] = useState<Album[]>([]);
  const { data: settings } = useSettings();
  const { playSwitch } = usePlayback();

  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const { cols } = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const albumPage = albums.slice(0, cols);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(albums.filter((album) => album).filter((album) => album.id === targetId));
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [albums, toggleMenu]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
    ROW_HEIGHT: Math.floor((width - VIEW_PADDING) / cols) + (settings.albumText ? 54 : 0),
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
  }), [cols, settings.albumText, width]);

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        gap="8px"
        height={settings.albumText ? measurements.ROW_HEIGHT : measurements.ROW_HEIGHT}
        mx="auto"
        width={measurements.ROW_WIDTH}
      >
        {settings.albumText && albumPage.map((album) => (
          <AlbumCard
            album={album}
            handleContextMenu={handleContextMenu}
            key={album.id}
            library={library}
            measurements={measurements}
            menuTarget={menuTarget}
            navigate={navigate}
          />
        ))}
        {!settings.albumText && albumPage.map((album) => (
          <AlbumCardNoText
            album={album}
            handleContextMenu={handleContextMenu}
            key={album.id}
            library={library}
            measurements={measurements}
            menuTarget={menuTarget}
            navigate={navigate}
          />
        ))}
      </Box>
      <AlbumMenu
        albums={menuTarget}
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        onClose={() => {
          toggleMenu(false);
          setMenuTarget([]);
        }}
        {...menuProps}
      />
    </Box>
  );
};

export default AlbumCarousel;
