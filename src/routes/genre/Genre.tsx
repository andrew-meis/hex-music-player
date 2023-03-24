import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import { throttle } from 'lodash';
import { useMemo, useRef } from 'react';
import { BiChevronRight } from 'react-icons/all';
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import AlbumHighlights from 'components/album-highlights/AlbumHighlights';
import ArtistHighlights from 'components/artist-highlights/ArtistHighlights';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import TrackHighlights from 'components/track-highlights/TrackHighlights';
import { WIDTH_CALC } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useAlbumsByGenre } from 'queries/album-queries';
import { useConfig, useLibrary, useSettings } from 'queries/app-queries';
import { useArtistsByGenre } from 'queries/artist-queries';
import { useLastfmTag } from 'queries/last-fm-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useTracksByGenre } from 'queries/track-queries';
import { LocationWithState, RouteParams } from 'types/interfaces';
import Banner from './Banner';

const getCols = (width: number) => {
  if (width >= 1350) {
    return 7;
  }
  if (width < 1350 && width >= 1100) {
    return 6;
  }
  if (width < 1100 && width >= 850) {
    return 5;
  }
  if (width < 850 && width >= 650) {
    return 4;
  }
  if (width < 650) {
    return 3;
  }
  return 5;
};

const Subheader = ({ text }: { text: string }) => (
  <MotionTypography
    color="text.primary"
    fontFamily="TT Commons"
    fontSize="1.625rem"
    marginRight="auto"
    whileHover="hover"
    width="fit-content"
  >
    <Link
      className="link"
      to="/home"
    >
      {text}
      <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
        <BiChevronRight />
      </MotionSvg>
    </Link>
  </MotionTypography>
);

const Genre = () => {
  const { data: config } = useConfig();
  const library = useLibrary();

  const box = useRef<HTMLDivElement>(null);
  const location = useLocation() as LocationWithState;
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: settings } = useSettings();
  const { getFormattedTime } = useFormattedTime();
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const { playSwitch } = usePlayback();
  const { width } = useOutletContext() as { width: number };

  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const { data: artists, isLoading: artistsLoading } = useArtistsByGenre({
    config,
    id: +id,
    library,
    limit: 0,
    sort: 'viewCount:desc',
  });
  const { data: albums, isLoading: albumsLoading } = useAlbumsByGenre({
    config,
    id: +id,
    library,
    limit: (grid.cols - 1) * 5,
    sort: 'viewCount:desc',
  });
  const { data: tracks, isLoading: tracksLoading } = useTracksByGenre({
    artistIds: artists?.map((artist) => artist.id) || [],
    config,
    id: +id,
    library,
    limit: 24,
    sort: 'viewCount:desc',
  });
  const { data: lastfmTag } = useLastfmTag({
    apikey: settings?.apiKey,
    tag: location.state.title,
  });

  const thumbs = useMemo(() => {
    if (!artists) return [];
    const allThumbs = artists.map((artist) => artist.thumb).filter((el) => el);
    const thumbUrls = allThumbs.map((thumb) => library.api.getAuthenticatedUrl(
      '/photo/:/transcode',
      {
        url: thumb, width: 390, height: 390, minSize: 1, upscale: 1,
      },
    ));
    return thumbUrls;
  }, [artists, library]);

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`genre-scroll ${id}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `genre-scroll ${id}`,
      0 as unknown as string,
    );
    return 0;
  }, [id, navigationType]);

  if (!artists || artistsLoading || albumsLoading || tracksLoading) {
    return null;
  }

  return (
    <motion.div
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      initial={{ opacity: 0 }}
      key={location.pathname}
      style={{ height: '100%' }}
      onAnimationComplete={() => box.current
        ?.scrollTo({ top: initialScrollTop })}
    >
      <Box
        className="scroll-container"
        height={1}
        ref={box}
        sx={{
          overflowX: 'hidden',
          overflowY: 'overlay',
        }}
        onScroll={(e) => {
          const target = e.currentTarget as unknown as HTMLDivElement;
          sessionStorage.setItem(
            `genre-scroll ${id}`,
            target.scrollTop as unknown as string,
          );
        }}
      >
        <Box
          maxHeight={390}
          maxWidth={1600}
          mb="1px"
          mx="auto"
        >
          <Banner
            cols={grid.cols}
            id={+id}
            thumbs={thumbs}
            title={location.state.title}
            width={width}
          />
        </Box>
        <Box
          marginX="auto"
          width={WIDTH_CALC}
        >
          {lastfmTag && lastfmTag.wiki.content && (
            <Box paddingY="32px">
              <Subheader text="About" />
              <Typography
                color="text.primary"
                fontFamily="Rubik"
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: 5,
                  wordBreak: 'break-word',
                }}
              >
                {lastfmTag.wiki.content.split(' <')[0]}
              </Typography>
            </Box>
          )}
          {tracks && tracks.length > 0 && (
            <>
              <Subheader text="Top Tracks" />
              <TrackHighlights
                getFormattedTime={getFormattedTime}
                isPlaying={isPlaying}
                library={library}
                nowPlaying={nowPlaying}
                playSwitch={playSwitch}
                rows={4}
                tracks={tracks}
              />
            </>
          )}
          <Subheader text="Top Artists" />
          <ArtistHighlights
            artists={artists.slice(0, (grid.cols - 1) * 5)}
            cols={grid.cols - 1}
            library={library}
            navigate={navigate}
            width={width}
          />
          {albums && albums.length > 0 && (
            <>
              <Subheader text="Top Albums" />
              <AlbumHighlights
                albums={albums}
                cols={grid.cols - 1}
                library={library}
                navigate={navigate}
                width={width}
              />
            </>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default Genre;
