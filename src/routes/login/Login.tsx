import { Box, useTheme } from '@mui/material';
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import styles from 'styles/Titlebar.module.scss';
import LoginPage from './LoginPage';

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
      className={styles.titlebar}
      style={{
        '--color': theme.palette.getContrastText(theme.palette.background.default),
        '--hover': theme.palette.action.selected,
      } as React.CSSProperties}
    >
      <Box
        display="flex"
        id="window-title-menu"
        width={150}
      />
      <Box
        display="flex"
        id="window-title-buttons"
        width={150}
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

interface LoginProps {
  authenticated: boolean | undefined;
  setAuthenticated: React.Dispatch<React.SetStateAction<boolean | undefined>>;
}

const Login = ({ authenticated, setAuthenticated }: LoginProps) => {
  if (authenticated) {
    return <Navigate replace to="/" />;
  }

  return (
    <>
      <Titlebar />
      <LoginPage setAuthenticated={setAuthenticated} />
    </>
  );
};

export default Login;
