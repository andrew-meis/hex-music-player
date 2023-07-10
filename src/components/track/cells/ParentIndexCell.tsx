import { SvgIcon, Typography } from '@mui/material';
import { CellContext } from '@tanstack/react-table';
import React from 'react';
import { BiAlbum } from 'react-icons/bi';
import { Track } from 'api/index';

const ParentIndexCell: React.FC<{
  info: CellContext<Track, number>;
}> = ({ info }) => (
  <div style={{ display: 'flex' }}>
    <SvgIcon sx={{ paddingRight: '8px', width: 40 }}>
      <BiAlbum />
    </SvgIcon>
    <Typography>
      {`Disc ${info.getValue()}`}
    </Typography>
  </div>
);

export default React.memo(ParentIndexCell);
