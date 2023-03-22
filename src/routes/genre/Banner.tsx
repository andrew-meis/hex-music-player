import { Box, Fade, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Library } from 'hex-plex';
import { useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import { Textfit } from 'react-textfit';
import { thresholds } from 'routes/artist/Header';
import mergeRefs from 'scripts/merge-refs';
import FixedHeader from './FixedHeader';

const getMeta = (url: string) => new Promise((resolve, reject) => {
  const img = new Image();
  img.onload = () => resolve(img);
  img.onerror = () => reject();
  img.src = url;
});

interface BannerProps {
  cols: number;
  library: Library;
  srcs: string[];
  title: string;
  width: number;
}

const Banner = ({ cols, library, srcs, title, width }: BannerProps) => {
  const box = useRef<HTMLDivElement>(null);
  const bannerInView = useInView({ threshold: thresholds });

  const bannerSrcs = srcs.map((src) => library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: src, width: 390, height: 390, minSize: 1, upscale: 1,
    },
  ));

  const { data: bannerDimensions } = useQuery(
    ['banner-dimensions', bannerSrcs],
    async () => {
      const dimensions = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const [, src] of bannerSrcs.entries()) {
        // eslint-disable-next-line no-await-in-loop
        const img = await getMeta(src) as HTMLImageElement;
        dimensions.push({ height: img.height, width: img.width });
      }
      return dimensions;
    },
    {
      enabled: !!bannerSrcs,
    },
  );

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
          width={width}
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
        {!!bannerDimensions && (
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
            {bannerSrcs.map((bannerSrc, index) => {
              const dims = bannerDimensions[index];
              return (
                <Box
                  key={bannerSrc}
                  sx={{
                    flexBasis: width / cols,
                    height: '100%',
                    marginLeft: index === 0 ? '' : '3px',
                  }}
                >
                  <Box
                    sx={{
                      background: `url(${bannerSrc}) no-repeat fixed`,
                      backgroundPositionX:
                        x + ((width / cols) * index) - ((dims.width - (width / cols)) / 2),
                      backgroundPositionY: '51px',
                      backgroundSize: Math.max(dims.height, dims.width),
                      flexBasis: width / cols,
                      height: '100%',
                      filter: 'grayscale(1) url("#monochrome")',
                    }}
                  />
                </Box>
              );
            })}
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
};

export default Banner;
