import { useTheme } from '@mui/material';
import React from 'react';
import styles from 'styles/PlayingAnimation.module.scss';

const PlayingAnimation = () => {
  const theme = useTheme();

  return (
    <div
      className={styles.icon}
      style={{ '--color': theme.palette.info.main } as React.CSSProperties}
    >
      <span />
      <span />
      <span />
    </div>
  );
};

export default PlayingAnimation;
