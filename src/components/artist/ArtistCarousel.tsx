import { Box } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import { throttle } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { NavigateFunction } from 'react-router-dom';
import { Artist, Library } from 'api/index';
import ArtistMenu from 'components/menus/ArtistMenu';
import { VIEW_PADDING } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { ArtistPreview } from 'routes/genre/Genre';
import { getColumns } from 'scripts/get-columns';
import ArtistCard from './ArtistCard';

interface ArtistCarouselProps {
  artists: Artist[] | ArtistPreview[];
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const ArtistCarousel = ({
  artists, library, navigate, width,
}: ArtistCarouselProps) => {
  const [menuTarget, setMenuTarget] = useState<Artist[]>([]);
  const { playSwitch } = usePlayback();

  const throttledCols = throttle(() => getColumns(width), 300, { leading: true });
  const { cols } = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const artistPage = artists.slice(0, cols);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState();

  const handleContextMenu = useCallback((event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    const target = event.currentTarget.getAttribute('data-id');
    if (!target) {
      return;
    }
    const targetId = parseInt(target, 10);
    setMenuTarget(artists
      .filter((artist) => artist).filter((artist) => artist.id === targetId) as Artist[]);
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [artists, toggleMenu]);

  const measurements = useMemo(() => ({
    IMAGE_SIZE:
      Math.floor(((width - VIEW_PADDING) / cols) - (((cols - 1) * 8) / cols)),
    ROW_HEIGHT: Math.floor(((width - VIEW_PADDING) / cols) * 0.70) + 54,
    ROW_WIDTH: (Math.floor((width - VIEW_PADDING) / cols)) * cols,
  }), [cols, width]);

  const handleClick = (artist: Artist | ArtistPreview) => navigate(
    `/artists/${artist.id}`,
    { state: { guid: artist.guid, title: artist.title } },
  );

  return (
    <>
      <Box
        display="flex"
        gap="8px"
        height={measurements.ROW_HEIGHT}
      >
        {artistPage.map((artist) => (
          <ArtistCard
            artist={artist}
            handleContextMenu={handleContextMenu}
            key={artist.id}
            library={library}
            measurements={measurements}
            menuTarget={menuTarget}
            onClick={() => handleClick(artist)}
          />
        ))}
      </Box>
      <ArtistMenu
        anchorPoint={anchorPoint}
        artists={menuTarget}
        playSwitch={playSwitch}
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

export default ArtistCarousel;
