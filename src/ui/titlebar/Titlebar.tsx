import { Box, useTheme } from '@mui/material';
import React, { useState } from 'react';
import useQueue from 'hooks/useQueue';
import { useNowPlaying } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';
import AppMenu from './menu/AppMenu';
import Search from './search/Search';
import TitlebarButtons from './TitlebarButtons';

const { platform } = window.electron.getAppInfo();

interface TitlebarProps {
  searchContainer: React.RefObject<HTMLDivElement>;
}

const Titlebar = ({ searchContainer }: TitlebarProps) => {
  const player = usePlayerContext();
  const theme = useTheme();
  const [isMaximized, setMaximized] = useState(false);
  const { data: nowPlaying } = useNowPlaying();
  const { updateTimeline } = useQueue();

  const handleAppClose = async () => {
    if (nowPlaying) {
      await updateTimeline(nowPlaying.id, 'stopped', player.currentPosition(), nowPlaying.track);
    }
    window.electron.quit();
  };

  const handleMaximizeToggle = () => {
    if (!isMaximized) {
      window.electron.maximize();
    } else {
      window.electron.unmaximize();
    }
    setMaximized(!isMaximized);
  };

  return (
    <Box
      className="titlebar"
      style={{
        '--color': theme.palette.getContrastText(theme.palette.background.default),
        '--hover': theme.palette.action.selected,
      } as React.CSSProperties}
    >
      <Box
        display="flex"
        height={50}
        id="window-title-menu"
        width={138}
      >
        {platform !== 'darwin' && (
          <AppMenu />
        )}
      </Box>
      <Search searchContainer={searchContainer} />
      <Box
        display="flex"
        height={50}
        id="window-title-buttons"
        justifyContent="flex-end"
        width={138}
      >
        {platform === 'darwin' && (
          <AppMenu />
        )}
        {platform !== 'darwin' && (
          <TitlebarButtons
            handleAppClose={handleAppClose}
            handleMaximizeToggle={handleMaximizeToggle}
            isMaximized={isMaximized}
          />
        )}
      </Box>
    </Box>
  );
};

export default Titlebar;
