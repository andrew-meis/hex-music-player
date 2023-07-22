import { Box, IconButton, Slider, SvgIcon } from '@mui/material';
import { useAtom } from 'jotai';
import React, { useState } from 'react';
import { RiVolumeDownFill, RiVolumeMuteFill, RiVolumeUpFill } from 'react-icons/ri';
import { iconButtonStyle } from 'constants/style';
import { volumeAtom } from 'root/Player';

const getViewbox = (volume: number) => {
  if (volume === 0) return '0 0 24 24';
  if (volume !== 0 && volume <= 60) return '3 0 24 24';
  return '0 0 24 24';
};

const VolumeSlider = () => {
  const [volume, setVolume] = useAtom(volumeAtom);
  const [isHovered, setHovered] = useState(false);
  const [prevVolume, setPrevVolume] = useState(0);

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
          height: '30px',
          width: '32px',
        }}
        onClick={handleVolumeClick}
      >
        {volume === 0
          && (
            <Box
              bgcolor="background.paper"
              height={30}
              position="absolute"
              right={5}
              width={9}
            />
          )}
        <SvgIcon
          sx={{
            width: '0.9em',
            height: '0.9em',
          }}
          viewBox={getViewbox(volume)}
        >
          {volume === 0
            && (
              <RiVolumeMuteFill />
            )}
          {volume !== 0 && volume <= 60
            && (
              <RiVolumeDownFill />
            )}
          {volume > 60
            && (
              <RiVolumeUpFill />
            )}
        </SvgIcon>
      </IconButton>
      <Slider
        aria-label="Volume"
        size="small"
        sx={{
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
      <span style={{ width: 18 }} />
    </>
  );
};

export default VolumeSlider;
