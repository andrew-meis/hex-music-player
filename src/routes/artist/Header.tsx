import { Avatar, Box, Fade, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { sample } from 'lodash';
import React, { useMemo } from 'react';
import { useInView } from 'react-intersection-observer';
import { Textfit } from 'react-textfit';
import styles from 'styles/ArtistHeader.module.scss';
import PlayShuffleButton from '../../components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail } from '../../hooks/plexHooks';
import { AppSettings } from '../../types/interfaces';
import { ArtistContext } from './Artist';
import FixedHeader from './FixedHeader';
import Highlights from './header-components/Highlights';
import InfoRow from './header-components/InfoRow';
import TopTracks from './header-components/TopTracks';

const getPosX = (settings: AppSettings) => {
  let leftWidth = 300;
  let rightWidth = 0;
  if (settings.compactNav) {
    leftWidth = 52;
  }
  if (settings.compactQueue) {
    rightWidth = 52;
  }
  if (settings.dockedQueue) {
    rightWidth = 300;
  }
  return (leftWidth / 2) - (rightWidth / 2);
};

const hex2rgb = (hex: string | undefined) => {
  if (!hex) {
    return '75, 75, 75';
  }
  // @ts-ignore
  const [r, g, b] = hex.match(/\w\w/g).map((x) => parseInt(x, 16));
  return `${r}, ${g}, ${b}`;
};

const scale = (inputY: number, yRange: number[], xRange: number[]) => {
  const [xMin, xMax] = xRange;
  const [yMin, yMax] = yRange;

  const percent = (inputY - yMin) / (yMax - yMin);
  return percent * (xMax - xMin) + xMin;
};

export const thresholds = Array.from(Array(101).keys()).map((n) => n / 100);

// eslint-disable-next-line react/require-default-props
const Header = ({ context }: { context?: ArtistContext }) => {
  const {
    artist: artistData, colors, library, navigate, playArtist, settings, width,
  } = context!;
  const { artist } = artistData!;
  const bannerInView = useInView({ threshold: thresholds });
  const tracksInView = useInView({ threshold: 0 });
  // calculated values
  const bannerResize = scale(bannerInView.entry?.intersectionRatio || 1, [0, 1], [0, 50]);
  const color = useMemo(() => sample(colors), [colors]);
  const hex = useMemo(() => hex2rgb(color), [color]);
  const posX = useMemo(() => getPosX(settings), [settings]);
  const bannerSrc = artist.art ? library.api.getAuthenticatedUrl(artist.art) : undefined;
  const thumbSrc = artist.thumb ? library.api.getAuthenticatedUrl(artist.thumb) : undefined;
  const thumbSrcSm = useThumbnail(artist.thumb || 'none', 100);
  const newHeaderText = useQuery(
    ['header-text'],
    () => '',
    {
      initialData: 'Albums',
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
    },
  );

  const handlePlay = () => playArtist(artist);
  const handleShuffle = () => playArtist(artist, true);

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
            artist={artist}
            handlePlay={handlePlay}
            handleShuffle={handleShuffle}
            headerText={tracksInView.inView ? 'Top Tracks' : newHeaderText.data}
            thumbSrcSm={thumbSrcSm}
          />
        </Box>
      </Fade>
      <Box
        alignItems="flex-end"
        display="flex"
        height="40vh"
        minHeight={390}
        ref={bannerInView.ref}
      >
        {artist.art
          && (
            <span
              className={styles['artist-banner']}
              style={{
                '--img': `url(${bannerSrc})`,
                '--color': hex,
                '--alpha': 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0),
                '--posX': `${posX}px`,
                '--grow': `${bannerResize}px`,
                '--width': width > 1600 ? '1600px' : `${width}px`,
              } as React.CSSProperties}
            />
          )}
        {!artist.art && !!artist.thumb
          && (
            <span
              className={styles['artist-banner']}
              style={{
                display: 'flex',
                '--color': hex,
                '--alpha': 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0) < 0.2
                  ? 0.2
                  : 1 - (bannerInView.entry ? bannerInView.entry.intersectionRatio : 0),
              } as React.CSSProperties}
            >
              <Box alignItems="center" display="flex" height={1} mx="auto" width="89%">
                <Avatar
                  alt={artist.title}
                  src={thumbSrc}
                  sx={{ width: 300, height: 300 }}
                />
              </Box>
            </span>
          )}
        <Box position="absolute" width="80%">
          <Textfit max={72} min={24} mode="single">
            <Typography
              color="common.white"
              fontFamily="TT Commons"
              fontSize="inherit"
              fontWeight={700}
              marginBottom="8px"
              marginLeft="22px"
              sx={{ textShadow: '2px 4px 8px rgb(40 40 48 / 60%)' }}
              variant="h1"
            >
              {artist.title}
            </Typography>
          </Textfit>
        </Box>
        <Box
          marginBottom="12px"
          position="absolute"
          right="22px"
        >
          <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
        </Box>
      </Box>
      <Box
        display="flex"
        flexWrap="wrap"
        mt="9px"
        mx="auto"
        ref={tracksInView.ref}
        width={(width * 0.89)}
      >
        <InfoRow artistData={artistData} colors={colors!} library={library} navigate={navigate} />
        <TopTracks context={context} />
        <Highlights
          artistData={artistData}
          height={context!.topTracks!.length * 56}
          library={library}
          navigate={navigate}
          width={width}
        />
      </Box>
    </>
  );
};

export default React.memo(Header);
