import { Box, SvgIcon, Typography } from '@mui/material';
import React, { useMemo } from 'react';
import { IoMdPricetag } from 'react-icons/all';
import { MotionBox } from 'components/motion-components/motion-components';
import { imageMotion } from 'components/motion-components/motion-variants';
import { useArtistsByGenre } from 'queries/artist-queries';
import styles from 'styles/MotionImage.module.scss';
import { GenresContext, GenreWithWidth, RowProps } from './Genres';

interface GenreCardProps {
  genre: GenreWithWidth;
  context: GenresContext;
}

const GenreCard = ({ genre, context }: GenreCardProps) => {
  const { library, measurements } = context;
  const { data, isLoading } = useArtistsByGenre({ fastKey: genre.fastKey, library });
  const imgSrc = useMemo(() => {
    if (!data) return undefined;
    let src: string;
    if (genre.width === 1) {
      const thumbs = data.map((artist) => artist.thumb).filter((thumb) => thumb);
      [src] = thumbs;
    }
    if (genre.width === 2) {
      const arts = data.map((artist) => artist.art).filter((art) => art);
      [src] = arts;
    }
    const url = library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: src!, height: 300, width: 300 * genre.width, minSize: 1, upscale: 1,
      },
    );
    return url;
  }, [data, genre, library]);

  return (
    <MotionBox
      className={styles.container}
      data-id={genre.id}
      height={measurements.ROW_HEIGHT}
      key={genre.id}
      sx={{
        background: 'none',
        borderRadius: '32px',
        willChange: 'transform',
      }}
      whileHover="hover"
      width={(measurements.IMAGE_SIZE * genre.width) + (8 * (genre.width - 1))}
      onClick={() => {}}
    >
      <svg height="0" width="0">
        <defs>
          <filter
            colorInterpolationFilters="sRGB"
            height="100%"
            id="monochrome"
            width="100%"
            x="0"
            y="0"
          >
            <feColorMatrix
              type="matrix"
              values="0.89 0 0 0 0.11
                      0.69 0 0 0 0.31
                      0.45 0 0 0 0.55
                      0    0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
      {!isLoading && (
        <MotionBox
          animate={{ opacity: 1 }}
          bgcolor="action.selected"
          className={styles.image}
          flexDirection="column-reverse"
          height={1}
          initial={{ opacity: 0 }}
          sx={{
            borderRadius: '32px',
            filter: 'grayscale(1) url("#monochrome")',
            transition: '0.2s',
            '--img': `url(${imgSrc})`,
          } as React.CSSProperties}
          variants={imageMotion}
          width={1}
        >
          {!imgSrc && (
            <SvgIcon
              className="generic-icon"
              sx={{ color: 'common.grey' }}
            >
              <IoMdPricetag />
            </SvgIcon>
          )}
        </MotionBox>
      )}
      <Typography
        bottom="20px"
        fontSize="2rem"
        marginX="12px"
        position="absolute"
        textAlign="center"
        variant="banner"
        width={((measurements.IMAGE_SIZE * genre.width) + (8 * (genre.width - 1))) - 24}
      >
        {genre.title}
      </Typography>
    </MotionBox>
  );
};

const Row = React.memo(({ genres, context }: RowProps) => {
  const {
    measurements,
  } = context;

  return (
    <Box
      display="flex"
      flexDirection="column"
    >
      <Box
        display="flex"
        gap="8px"
        height={measurements.ROW_HEIGHT + 8}
        mx="auto"
        width={measurements.ROW_WIDTH}
      >
        {genres.map((genre) => (
          <GenreCard
            context={context}
            genre={genre}
            key={genre.id}
          />
        ))}
      </Box>
    </Box>
  );
});

export default Row;
