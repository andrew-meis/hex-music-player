import { Box, useTheme } from '@mui/material';
import React, { useState } from 'react';
import styles from 'styles/Titlebar.module.scss';

const Titlebar = () => {
  const theme = useTheme();
  const [isMaximized, setMaximized] = useState(false);

  const handleAppClose = async () => {
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
        width={132}
      />
      <Box
        display="flex"
        height={50}
        id="window-title-buttons"
        width={132}
      >
        <Box className={styles['minimize-button']} onClick={() => window.electron.minimize()}>
          <span />
        </Box>
        {!isMaximized
          && (
            <Box className={styles['maximize-button']} onClick={handleMaximizeToggle}>
              <span />
            </Box>
          )}
        {isMaximized
          && (
            <Box className={styles['contract-button']} onClick={handleMaximizeToggle}>
              <span />
              <span />
            </Box>
          )}
        <Box className={styles['close-button']} onClick={handleAppClose}>
          <span />
          <span />
        </Box>
      </Box>
    </Box>
  );
};

export default Titlebar;
