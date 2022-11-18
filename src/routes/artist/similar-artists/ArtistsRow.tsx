import { Box, Typography } from '@mui/material';
import { Artist, Library } from 'hex-plex';
import React from 'react';
import styles from 'styles/AlbumsRow.module.scss';
import { RowProps } from './SimilarArtists';

const textStyle = {
  color: 'text.primary',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.2,
  mt: '2px',
  mx: '8px',
  position: 'relative',
  top: '-64px',
};

interface ArtistCardProps {
  artist: Artist;
  grid: { cols: number };
  library: Library;
  width: number;
}

const ArtistCard = ({ artist, grid, library, width }: ArtistCardProps) => {
  const imgHeight = (Math.floor((width * 0.89) / grid.cols) * 1.3) + 30;
  const imgWidth = Math.floor((width * 0.89) / grid.cols);
  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: artist.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
    },
  );

  return (
    <Box
      className={styles['album-box']}
      data-id={artist.id}
      height={imgHeight + 30}
      key={artist.id}
      width={imgWidth}
    >
      <Box
        className={styles['album-cover']}
        height={imgHeight - 8}
        margin="4px"
        style={{
          alignItems: 'flex-end',
          borderRadius: '32px',
          contain: 'paint',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        width={imgWidth - 8}
      >
        <Box
          height="68px"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
          }}
          width={imgWidth - 8}
        />
      </Box>
      <Typography sx={textStyle}>
        {artist.title}
      </Typography>
    </Box>
  );
};

const ArtistsRow = React.memo(({ index, context }: RowProps) => {
  const {
    grid, items: { rows }, library, width,
  } = context;
  const { artists, section } = rows![index];

  return (
    <Box
      display="flex"
      height={(Math.floor((width * 0.89) / grid.cols) * 1.3) + 30}
      mx="auto"
      width={(width * 0.89)}
    >
      {artists.map((artist) => (
        <ArtistCard
          artist={artist}
          grid={grid}
          key={artist.id}
          library={library}
          width={width}
        />
      ))}
    </Box>
  );
});

export default ArtistsRow;
