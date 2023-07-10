import { Typography } from '@mui/material';
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Track } from 'api/index';
import Subtext, { SubtextOptions } from 'components/subtext/Subtext';
import { typographyStyle } from 'constants/style';

const TitleCell: React.FC<{
  options: SubtextOptions;
  playing: boolean,
  track: Track,
}> = ({ options, playing, track }) => (
  <>
    <Typography
      color="text.primary"
      fontFamily="Rubik, sans-serif"
      fontSize="0.95rem"
      fontWeight={playing ? 600 : 'inherit'}
      sx={typographyStyle}
    >
      <NavLink
        className="link"
        style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
        to={`/tracks/${track.id}`}
      >
        {track.title}
      </NavLink>
    </Typography>
    {options.showSubtext && (
      <Typography fontSize="0.95rem" sx={typographyStyle}>
        <Subtext showAlbum={options.albumTitle} track={track} />
      </Typography>
    )}
  </>
);

export default React.memo(TitleCell);
