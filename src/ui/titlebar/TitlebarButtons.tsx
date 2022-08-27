import { Box } from '@mui/material';
import React from 'react';
import styles from 'styles/Titlebar.module.scss';

interface TitlebarButtonsProps {
  handleAppClose: () => void;
  handleMaximizeToggle: () => void;
  isMaximized: boolean;
}

const TitlebarButtons = (
  { handleAppClose, handleMaximizeToggle, isMaximized }: TitlebarButtonsProps
) => (
  <>
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
  </>
);

export default TitlebarButtons;
