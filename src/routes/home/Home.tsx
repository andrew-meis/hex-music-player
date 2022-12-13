import { Avatar, Box, Typography } from '@mui/material';
import chroma from 'chroma-js';
import fontColorContrast from 'font-color-contrast';
import { motion, AnimatePresence } from 'framer-motion';
import { Album } from 'hex-plex';
import { uniqBy } from 'lodash';
import React, { useMemo, useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import Palette from 'components/palette/Palette';
import { useThumbnail } from 'hooks/plexHooks';
import { useAlbumSearch, useTopAlbums } from 'queries/album-queries';
import { useConfig, useLibrary } from 'queries/app-queries';

const MotionBox = motion(Box);

const variants = {
  hide: {
    opacity: 0,
    zIndex: 0,
  },
  visible: (difference: number) => {
    if (difference === 0) {
      return {
        scale: 1,
        opacity: 1,
        left: '10%',
        zIndex: 3,
      };
    }
    if (difference === 1 || difference === -1) {
      return {
        cursor: 'pointer',
        scale: 0.8,
        opacity: 0.6,
        left: difference === 1 ? '0' : '20%',
        zIndex: 2,
      };
    }
    if (difference === 2 || difference === -2) {
      return {
        scale: 0.8,
        opacity: 0,
        left: difference === 2 ? '0%' : '20%',
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
  const parentThumbSrc = useThumbnail(album.parentThumb, 100);
  const thumbSrc = useThumbnail(album.thumb, 500);
  const difference = activeIndex - index;
  return (
    <AnimatePresence custom={difference} initial={false}>
      {difference >= -2 && difference <= 2 && (
        <Palette src={album.thumb} url={thumbSrc}>
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
                height="300px"
                initial="hide"
                position="absolute"
                sx={{
                  backgroundImage:
                  `radial-gradient(circle at 115% 85%, ${gradStart}, ${gradEndOne} 40%),
                   radial-gradient(circle at 5% 5%, ${gradStart}, ${gradEndTwo} 70%)`,
                }}
                top="24px"
                transition={{
                  left: { type: 'spring', stiffness: 200, damping: 30 },
                  opacity: { duration: 0.2 },
                }}
                variants={variants}
                width="80%"
                onClick={() => setActiveIndex(index)}
              >
                <Avatar
                  alt={album.title}
                  src={thumbSrc}
                  sx={{
                    height: '252px',
                    ml: '24px',
                    mt: '24px',
                    width: '252px',
                  }}
                  variant="rounded"
                />
                <Box
                  color="black"
                  display="flex"
                  flexDirection="column"
                  height="calc(100% - 48px)"
                  justifyContent="flex-end"
                  mx="24px"
                  my="24px"
                >
                  <Box display="flex" height={24}>
                    {album.format.map((item, i, { length }) => {
                      if (length - 1 === i) {
                        return (
                          <Typography key={item.tag} variant="subtitle2">
                            {item.tag.toLowerCase()}
                          </Typography>
                        );
                      }
                      return (
                        <Typography key={item.tag} variant="subtitle2">
                          {item.tag.toLowerCase()}
                          {' ·'}
                          &nbsp;
                        </Typography>
                      );
                    })}
                  </Box>
                  <Typography fontFamily="TT Commons" fontSize="2.625rem" lineHeight={1}>
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
  const { data: newAlbums, isLoading: l1 } = useAlbumSearch(
    config.data,
    library,
    {
      'album.originallyAvailableAt>>': '-90d',
      sort: 'originallyAvailableAt:desc',
    },
  );
  const { data: topAlbums, isLoading: l2 } = useTopAlbums({
    config: config.data,
    library,
    limit: 10,
    seconds: 60 * 60 * 24 * 30,
  });

  const location = useLocation();
  const [activeIndex, setActiveIndex] = useState(0);
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

  if (l1 || l2) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
    >
      <MotionBox
        display="flex"
        flexDirection="row"
        height="348px"
        mx="auto"
        width="89%"
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
    </motion.div>
  );
};

export default Home;
