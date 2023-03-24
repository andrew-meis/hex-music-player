import { Box, Fade, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { AnimatePresence, motion } from 'framer-motion';
import { sample, sampleSize } from 'lodash';
import React, { useEffect, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Textfit } from 'react-textfit';
import { MotionBox } from 'components/motion-components/motion-components';
import { thresholds } from 'routes/artist/Header';
import mergeRefs from 'scripts/merge-refs';
import FixedHeader from './FixedHeader';

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);

const getMeta = (url: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject();
  img.src = url;
});

interface Thumb {
  height: number;
  src: string;
  width: number;
}

const getPrevThumbs = (id: number) => {
  const prev = sessionStorage.getItem(`banner-thumbs ${id}`);
  try {
    return JSON.parse(prev!) as Thumb[];
  } catch {
    return [];
  }
};

interface BannerProps {
  cols: number;
  id: number;
  thumbs: string[];
  title: string;
  width: number;
}

const Banner = React.memo(({ cols, id, thumbs, title, width: viewWidth }: BannerProps) => {
  const box = useRef<HTMLDivElement>(null);
  const bannerInView = useInView({ threshold: thresholds });
  const currentThumbs = useRef<Thumb[]>(getPrevThumbs(id));

  const { data: staticThumbs } = useQuery(
    ['static-thumbs', id, cols],
    async () => {
      const array = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [, src] of thumbs.entries()) {
        // eslint-disable-next-line no-await-in-loop
        const img = await getMeta(src) as HTMLImageElement;
        array.push({ height: img.height, src, width: img.width });
      }
      currentThumbs.current = array;
      return array as Thumb[];
    },
    {
      enabled: thumbs.length <= cols,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  const { data: randomizedThumbs } = useQuery(
    ['random-thumbs', id, cols],
    async () => {
      if (!currentThumbs.current || currentThumbs.current.length === 0) {
        const newThumbs = sampleSize(thumbs, cols);
        const array = [];
        // eslint-disable-next-line no-restricted-syntax
        for (const [, src] of newThumbs.entries()) {
          // eslint-disable-next-line no-await-in-loop
          const img = await getMeta(src) as HTMLImageElement;
          array.push({ height: img.height, src, width: img.width });
        }
        currentThumbs.current = array;
        return array as Thumb[];
      }
      const unusedThumbs = thumbs
        .filter((thumb) => !currentThumbs.current.map((el) => el.src).includes(thumb));
      if (currentThumbs.current.length < cols) {
        const array = structuredClone(currentThumbs.current);
        const newThumbs = sampleSize(unusedThumbs, cols - currentThumbs.current.length);
        // eslint-disable-next-line no-restricted-syntax
        for (const [, src] of newThumbs.entries()) {
          // eslint-disable-next-line no-await-in-loop
          const img = await getMeta(src) as HTMLImageElement;
          array.push({ height: img.height, src, width: img.width });
        }
        currentThumbs.current = array;
        return array as Thumb[];
      }
      if (currentThumbs.current.length > cols) {
        const array = structuredClone(currentThumbs.current).slice(0, cols);
        currentThumbs.current = array;
        return array;
      }
      const array = structuredClone(currentThumbs.current);
      const newThumb = sample(unusedThumbs)!;
      const img = await getMeta(newThumb) as HTMLImageElement;
      const randomN = randomInt(0, cols - 1);
      array.splice(randomN, 1, { height: img.height, src: newThumb, width: img.width });
      currentThumbs.current = array;
      return array as Thumb[];
    },
    {
      enabled: thumbs.length > cols,
      refetchInterval: 15000,
      refetchOnMount: false,
      refetchOnWindowFocus: false,
    },
  );

  useEffect(() => () => {
    sessionStorage.setItem(
      `banner-thumbs ${id}`,
      JSON.stringify(randomizedThumbs),
    );
  }, [randomizedThumbs, id]);

  const { x } = box.current?.getBoundingClientRect() || { x: 0 };

  return (
    <>
      <Fade
        in={!bannerInView.inView
          && ((bannerInView.entry ? bannerInView.entry.intersectionRatio : 1) < 1)}
        style={{ transformOrigin: 'center top' }}
        timeout={{ enter: 300, exit: 0 }}
      >
        <Box
          height={71}
          position="fixed"
          width={viewWidth}
          zIndex={400}
        >
          <FixedHeader
            title={title}
          />
        </Box>
      </Fade>
      <Box
        alignItems="flex-end"
        display="flex"
        height={390}
        minHeight={390}
        ref={mergeRefs(bannerInView.ref, box)}
      >
        {(!!randomizedThumbs || !!staticThumbs) && (
          <motion.div
            animate={{ opacity: 1 }}
            initial={{ opacity: 0 }}
            style={{
              display: 'flex',
              height: '100%',
              width: '100%',
            }}
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
            {staticThumbs && staticThumbs.map(({ height, src, width }, index, array) => (
              <Box
                key={src}
                sx={{
                  flexBasis: viewWidth / array.length,
                  height: '100%',
                  marginLeft: index === 0 ? '' : '3px',
                }}
              >
                <MotionBox
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  initial={{ opacity: 0 }}
                  sx={{
                    background: `url(${src}) no-repeat fixed`,
                    backgroundPositionX:
                      x + ((viewWidth / array.length) * index)
                       - ((width - (viewWidth / array.length)) / 2),
                    backgroundPositionY: '51px',
                    backgroundSize: Math.max(height, width),
                    height: '100%',
                    filter: 'grayscale(1) url("#monochrome")',
                  }}
                  transition={{ duration: 0.4 }}
                />
              </Box>
            ))}
            {randomizedThumbs && randomizedThumbs.map(({ height, src, width }, index) => (
              <AnimatePresence key={src}>
                <Box
                  key={src}
                  sx={{
                    flexBasis: viewWidth / cols,
                    height: '100%',
                    marginLeft: index === 0 ? '' : '3px',
                  }}
                >
                  <MotionBox
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                    sx={{
                      background: `url(${src}) no-repeat fixed`,
                      backgroundPositionX:
                        x + ((viewWidth / cols) * index) - ((width - (viewWidth / cols)) / 2),
                      backgroundPositionY: '51px',
                      backgroundSize: Math.max(height, width),
                      height: '100%',
                      filter: 'grayscale(1) url("#monochrome")',
                    }}
                    transition={{ duration: 0.4 }}
                  />
                </Box>
              </AnimatePresence>
            ))}
          </motion.div>
        )}
      </Box>
      <Box bottom={100} position="relative" textAlign="center" width="100%">
        <Textfit max={72} min={24} mode="single">
          <Typography
            marginBottom="8px"
            variant="banner"
          >
            {title}
          </Typography>
        </Textfit>
      </Box>
    </>
  );
});

export default Banner;
