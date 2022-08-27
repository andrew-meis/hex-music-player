import { IconButton, Slider, SvgIcon } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { IoVolumeLow, IoVolumeMedium, IoVolumeOff } from 'react-icons/all';
import { iconButtonStyle, sliderStyle } from '../../constants/style';
import { usePlayerState } from '../../hooks/queryHooks';
import { usePlayerContext } from '../../core/Player';

const VolumeSlider = () => {
  const player = usePlayerContext();
  const [isHovered, setHovered] = useState(false);
  const [volume, setVolume] = useState(50);
  const [prevVolume, setPrevVolume] = useState(0);
  const { data: playerState } = usePlayerState();

  useEffect(() => {
    if (player.currentSource() === undefined) {
      return;
    }
    player.setVolume(volume / 150);
  }, [player, playerState.isPlaying, volume]);

  const handleVolumeChange = (event: Event, newVolume: number | number[]) => {
    setVolume(newVolume as number);
  };

  const handleVolumeWheel = (event: React.WheelEvent<HTMLInputElement>) => {
    if (event.deltaY > 0) {
      const newVolume = volume - 5;
      if (newVolume <= 0) {
        setVolume(0);
        return;
      }
      setVolume(newVolume);
    }
    if (event.deltaY < 0) {
      const newVolume = volume + 5;
      if (newVolume >= 100) {
        setVolume(100);
        return;
      }
      setVolume(newVolume);
    }
  };

  const handleVolumeClick = () => {
    if (volume === 0) {
      setVolume(prevVolume);
      return;
    }
    if (volume > 0) {
      setPrevVolume(volume);
      setVolume(0);
    }
  };

  return (
    <>
      <IconButton
        disableRipple
        size="small"
        sx={{
          ...iconButtonStyle,
          position: 'absolute',
          right: volume === 0 ? '112px' : '110px',
        }}
        onClick={handleVolumeClick}
      >
        <SvgIcon
          sx={{
            width: volume <= 60 ? '0.95em' : '0.9em',
            height: '0.9em',
            marginRight: volume > 60 ? '2px' : '3px',
          }}
        >
          {volume === 0
            && (
              <IoVolumeOff />
            )}
          {volume !== 0 && volume <= 60
            && (
              <IoVolumeLow />
            )}
          {volume > 60
            && (
              <IoVolumeMedium />
            )}
        </SvgIcon>
      </IconButton>
      <Slider
        aria-label="Volume"
        size="small"
        sx={{
          ...sliderStyle,
          width: 100,
          '& .MuiSlider-thumb': {
            display: isHovered ? 'flex' : 'none',
          },
        }}
        value={volume}
        onChange={handleVolumeChange}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onWheel={handleVolumeWheel}
      />
      <span style={{ width: 12 }} />
    </>
  );
};

export default VolumeSlider;
