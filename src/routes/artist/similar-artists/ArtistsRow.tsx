import { Box, Typography } from '@mui/material';
import { Artist, Library } from 'hex-plex';
import React from 'react';
import { NavigateFunction } from 'react-router-dom';
import styles from 'styles/AlbumsRow.module.scss';
import { RowProps } from './SimilarArtists';

const textStyle = {
  color: 'common.white',
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'Rubik',
  fontSize: '1rem',
  fontWeight: 600,
  lineHeight: 1.2,
  mx: '16px',
  position: 'relative',
  top: '-68px',
  height: '44px',
};

interface ArtistCardProps {
  artist: Artist;
  grid: { cols: number };
  library: Library;
  navigate: NavigateFunction;
  width: number;
}

const ArtistCard = ({ artist, grid, library, navigate, width }: ArtistCardProps) => {
  const imgHeight = (Math.floor((width * 0.89) / grid.cols) * 1.2) + 30;
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
      onClick={() => navigate(
        `/artists/${artist.id}`,
        { state: { guid: artist.guid, title: artist.title } },
      )}
    >
      <Box
        className={styles['album-cover']}
        height={imgHeight - 8}
        margin="4px"
        style={{
          alignItems: 'flex-end',
          borderRadius: '32px',
          '--img': `url(${thumbSrc})`,
        } as React.CSSProperties}
        width={imgWidth - 8}
      >
        <Box
          height="68px"
          sx={{
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            borderBottomLeftRadius: '30px',
            borderBottomRightRadius: '30px',
          }}
          width={imgWidth}
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
    grid, items: { rows }, library, navigate, width,
  } = context;
  const { artists } = rows![index];

  return (
    <Box
      display="flex"
      height={(Math.floor((width * 0.89) / grid.cols) * 1.2) + 30}
      mx="auto"
      width={(width * 0.89)}
    >
      {artists.map((artist) => (
        <ArtistCard
          artist={artist}
          grid={grid}
          key={artist.id}
          library={library}
          navigate={navigate}
          width={width}
        />
      ))}
    </Box>
  );
});

export default ArtistsRow;
