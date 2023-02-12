import { Avatar, Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import fontColorContrast from 'font-color-contrast';
import { motion, AnimatePresence } from 'framer-motion';
import { Album } from 'hex-plex';
import { uniqBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { MotionBox } from 'components/motion-components/motion-components';
import PaginationDots from 'components/pagination-dots/PaginationDots';
import Palette from 'components/palette/Palette';
import { WIDTH_CALC } from 'constants/measures';
import { useThumbnail } from 'hooks/plexHooks';
import { useAlbumSearch, useTopAlbums } from 'queries/album-queries';
import { useConfig, useLibrary } from 'queries/app-queries';

const scale = (inputY: number, yRange: number[], xRange: number[]) => {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const percent = (inputY - yMin) / (yMax - yMin);
  return percent * (xMax - xMin) + xMin;
};

const variants = {
  hide: {
    opacity: 0,
    margin: 'auto',
    zIndex: 0,
  },
  visible: (difference: number) => {
    if (difference === 0) {
      return {
        cursor: 'default',
        scale: 1,
        opacity: 1,
        left: '0%',
        zIndex: 3,
      };
    }
    if (difference === 1 || difference === -1) {
      return {
        cursor: 'pointer',
        scale: 0.8,
        opacity: 0.6,
        left: difference === 1 ? 'calc(-10% - 16px)' : 'calc(10% + 16px)',
        zIndex: 2,
      };
    }
    if (difference === 2 || difference === -2) {
      return {
        scale: 0.8,
        opacity: 0,
        left: difference === 2 ? 'calc(-10% - 16px)' : 'calc(10% + 16px)',
        zIndex: 1,
      };
    }
    return {
      opacity: 0,
      zIndex: 0,
    };
  },
};

interface ItemProps {
  activeIndex: number;
  album: Album;
  index: number;
  setActiveIndex: React.Dispatch<React.SetStateAction<number>>;
}

const Item = ({ activeIndex, album, index, setActiveIndex }: ItemProps) => {
  const navigate = useNavigate();
  const [parentThumbSrc] = useThumbnail(album.parentThumb, 100);
  const [thumbSrc, thumbUrl] = useThumbnail(album.thumb, 500);
  const difference = activeIndex - index;
  return (
    <AnimatePresence custom={difference} initial={false}>
      {difference >= -2 && difference <= 2 && (
        <Palette id={album.thumb} url={thumbUrl}>
          {({ data: colors, isLoading, error }) => {
            if (isLoading || error || !colors) {
              return null;
            }
            // const contrastBool = chroma.contrast(colors.vibrant, 'black') > 4.5;
            const gradStart = chroma(colors.vibrant).brighten().css();
            const gradEndOne = chroma(colors.vibrant).alpha(0.6).css();
            const gradEndTwo = chroma(colors.vibrant).css();
            return (
              <MotionBox
                layout
                animate="visible"
                borderRadius="24px"
                custom={difference}
                display="flex"
                exit="hide"
                flexDirection="row"
                height="100%"
                initial="hide"
                maxWidth={900}
                position="absolute"
                sx={{
                  backgroundImage:
                  `radial-gradient(circle at 115% 85%, ${gradStart}, ${gradEndOne} 40%),
                   radial-gradient(circle at 5% 5%, ${gradStart}, ${gradEndTwo} 70%)`,
                }}
                transition={{
                  left: { type: 'spring', stiffness: 200, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                variants={variants}
                width="100%"
                onClick={() => setActiveIndex(index)}
              >
                <Avatar
                  alt={album.title}
                  src={thumbSrc}
                  sx={{
                    height: 'auto',
                    m: '18px',
                    width: 'auto',
                  }}
                  variant="rounded"
                />
                <Box
                  color="black"
                  display="flex"
                  flexDirection="column"
                  height="calc(100% - 36px)"
                  justifyContent="flex-end"
                  mb="18px"
                  mr="18px"
                  mt="18px"
                >
                  <Box display="flex" height={24} overflow="hidden">
                    <Typography variant="subtitle2">
                      {album.format.map((item, i, { length }) => {
                        if (length - 1 === i) return item.tag.toLowerCase();
                        return `${item.tag.toLowerCase()} · `;
                      })}
                    </Typography>
                  </Box>
                  <Typography variant="home">
                    <NavLink
                      className="link"
                      to={`/albums/${album.id}`}
                    >
                      {album.title}
                    </NavLink>
                  </Typography>
                  <Box
                    alignItems="center"
                    borderRadius="20px"
                    display="flex"
                    height="36px"
                    mt="8px"
                    sx={{
                      background: !colors
                        ? 'active.selected'
                        : chroma(colors.muted).saturate(2).brighten(1).hex(),
                      cursor: 'pointer',
                      transition: 'box-shadow 200ms ease-in',
                      '&:hover': { boxShadow: 'inset 0 0 0 1000px rgba(255, 255, 255, 0.3)' },
                    }}
                    width="fit-content"
                    onClick={() => navigate(
                      `/artists/${album.parentId}`,
                      { state: { guid: album.parentGuid, title: album.parentTitle } },
                    )}
                  >
                    <Avatar
                      alt={album.parentTitle}
                      src={parentThumbSrc}
                      sx={{ width: '32px', height: '32px', ml: '2px' }}
                    />
                    <Typography
                      color={!colors
                        ? 'text.main'
                        : fontColorContrast(chroma(colors.muted).saturate(2).brighten(1).hex())}
                      fontSize="0.875rem"
                      ml="8px"
                      mr="12px"
                      whiteSpace="nowrap"
                    >
                      {album.parentTitle}
                    </Typography>
                  </Box>
                </Box>
              </MotionBox>
            );
          }}
        </Palette>
      )}
    </AnimatePresence>
  );
};

const Home = () => {
  const config = useConfig();
  const library = useLibrary();
  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
  const { width } = useOutletContext() as { width: number };

  const { data: newAlbums, isLoading: loadingNewAlbums } = useAlbumSearch(
    config.data,
    library,
    {
      'album.originallyAvailableAt>>': '-90d',
      sort: 'originallyAvailableAt:desc',
    },
  );
  const { data: topAlbums, isLoading: loadingTopAlbums } = useTopAlbums({
    config: config.data,
    library,
    limit: 10,
    seconds: 60 * 60 * 24 * 30,
  });

  const fontSize = scale(Math.min(Math.floor(width * 0.4), 300), [188, 300], [1.64, 2.625]);

  const cards = useMemo(() => {
    const albums = [];
    if (newAlbums) albums.push(...newAlbums);
    if (topAlbums) albums.push(...topAlbums);
    const unique = uniqBy(albums, 'id');
    unique.forEach((album) => {
      if (newAlbums
        && newAlbums.find((el) => el.id === album.id)
        && !album.format.some(({ tag }) => tag === 'new release')
      ) {
        album.format.push({ filter: '', id: 0, tag: 'new release' });
      }
      if (topAlbums
        && topAlbums.find((el) => el.id === album.id)
        && !album.format.some(({ tag }) => tag === 'recent favorite')
      ) {
        album.format.push({ filter: '', id: 0, tag: 'recent favorite' });
      }
    });
    return unique;
  }, [newAlbums, topAlbums]);

  if (loadingNewAlbums || loadingTopAlbums) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%', '--home-banner-font-size': `${fontSize}rem` } as React.CSSProperties}
    >
      <Box
        maxWidth="900px"
        mx="auto"
        width={WIDTH_CALC}
      >
        <Box
          alignItems="center"
          color="text.primary"
          display="flex"
          height={70}
          paddingX="6px"
        >
          <Typography variant="h1">Home</Typography>
        </Box>
      </Box>
      <MotionBox
        display="flex"
        flexDirection="row"
        height={Math.floor(width * 0.4)}
        margin="auto"
        maxHeight={300}
        maxWidth="900px"
        width={WIDTH_CALC}
      >
        <MotionBox
          display="flex"
          flexDirection="row"
          sx={{
            transform: 'translateZ(0px)',
          }}
          width="100%"
        >
          {cards.map((album, index) => (
            <Item
              activeIndex={activeIndex}
              album={album}
              index={index}
              key={album.id}
              setActiveIndex={setActiveIndex}
            />
          ))}
        </MotionBox>
      </MotionBox>
      <Box>
        <PaginationDots
          activeIndex={activeIndex}
          array={cards}
          colLength={1}
          setActiveIndex={setActiveIndex}
        />
      </Box>
    </motion.div>
  );
};

export default Home;
