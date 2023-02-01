import { Box, IconButton, Slider, SvgIcon } from '@mui/material';
import React, { useEffect, useState } from 'react';
import { RiVolumeDownFill, RiVolumeMuteFill, RiVolumeUpFill } from 'react-icons/all';
import { iconButtonStyle } from 'constants/style';
import { usePlayerState } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { usePlayerContext } from 'root/Player';

const getViewbox = (volume: number) => {
  if (volume === 0) return '0 0 24 24';
  if (volume !== 0 && volume <= 60) return '3 0 24 24';
  return '0 0 24 24';
};

const VolumeSlider = () => {
  const player = usePlayerContext();
  const [isHovered, setHovered] = useState(false);
  const [volume, setVolume] = useState(50);
  const [prevVolume, setPrevVolume] = useState(0);
  const { data: nowPlaying } = useNowPlaying();
  const { data: playerState } = usePlayerState();

  useEffect(() => {
    if (player.currentSource() === undefined) {
      return;
    }
    if (nowPlaying?.track.media[0].parts[0].streams[0].gain) {
      const decibelLevel = 20 * Math.log10(volume / 100);
      const applyTrackGain = decibelLevel + (+nowPlaying.track.media[0].parts[0].streams[0].gain);
      const gainLevel = 10 ** (applyTrackGain / 20);
      player.setVolume(gainLevel);
      return;
    }
    player.setVolume(volume / 150);
  }, [nowPlaying, player, playerState.isPlaying, volume]);

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
      <span style={{ width: 12 }} />
    </>
  );
};

export default VolumeSlider;
