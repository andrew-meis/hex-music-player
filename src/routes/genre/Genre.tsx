import { Box, Typography } from '@mui/material';
import { AnimatePresence, motion } from 'framer-motion';
import { throttle, uniqBy } from 'lodash';
import { useMemo, useRef, useState } from 'react';
import { BiChevronRight } from 'react-icons/all';
import {
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
  useParams,
} from 'react-router-dom';
import { Artist } from 'api/index';
import AlbumCarousel from 'components/album/AlbumCarousel';
import ArtistCarousel from 'components/artist/ArtistCarousel';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import TrackCarousel from 'components/track/TrackCarousel';
import { WIDTH_CALC } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import { useAlbumsByGenre } from 'queries/album-queries';
import { useConfig, useLibrary, useSettings } from 'queries/app-queries';
import { useLastfmTag } from 'queries/last-fm-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { useTracksByGenre } from 'queries/track-queries';
import { getColumnsNarrow } from 'scripts/get-columns';
import { LocationWithState, RouteParams } from 'types/interfaces';
import Banner from './Banner';

export type ArtistPreview = Pick<Artist,
  'guid' | 'id' | 'key' | 'ratingKey' | 'thumb' | 'title' | 'viewCount'>;

const Subheader = ({ text, onClick }: { text: string, onClick: () => void }) => (
  <MotionTypography
    className="link"
    color="text.primary"
    fontFamily="TT Commons"
    fontSize="1.625rem"
    marginRight="auto"
    whileHover="hover"
    width="fit-content"
    onClick={onClick}
  >
    {text}
    <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
      <BiChevronRight />
    </MotionSvg>
  </MotionTypography>
);

const Genre = () => {
  const box = useRef<HTMLDivElement>(null);
  const library = useLibrary();
  const location = useLocation() as LocationWithState;
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const [expandedText, setExpandedText] = useState(false);
  const { data: config } = useConfig();
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { data: settings } = useSettings();
  const { getFormattedTime } = useFormattedTime();
  const { id } = useParams<keyof RouteParams>() as RouteParams;
  const { width } = useOutletContext() as { width: number };

  const throttledCols = throttle(() => getColumnsNarrow(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const { data: albums, isLoading: albumsLoading } = useAlbumsByGenre({
    config,
    id: +id,
    library,
    limit: 0,
    sort: 'viewCount:desc',
  });
  const { data: tracks, isLoading: tracksLoading } = useTracksByGenre({
    albumIds: albums?.map((album) => album.id) || [],
    config,
    id: +id,
    library,
    limit: 24,
    sort: 'viewCount:desc',
  });
  const { data: lastfmTag, isLoading: lastfmLoading } = useLastfmTag({
    apikey: settings?.apiKey,
    tag: location.state.title,
  });

  const artists = useMemo(() => {
    if (!albums) return [];
    const artistsFromAlbums = albums.map(({
      parentGuid,
      parentId,
      parentKey,
      parentRatingKey,
      parentThumb,
      parentTitle,
      viewCount,
    }) => ({
      guid: parentGuid,
      id: parentId,
      key: parentKey,
      ratingKey: parentRatingKey,
      thumb: parentThumb,
      title: parentTitle,
      viewCount,
    }));
    const uniqArtists = uniqBy(artistsFromAlbums, 'guid');
    const viewCountArrays = uniqArtists
      .map((artist) => ({
        id: artist.id,
        viewCount: artistsFromAlbums
          .filter((prev) => prev.id === artist.id)
          .map((v) => v.viewCount)
          .filter((v) => v)
          .reduce((partialSum, a) => (partialSum + a), 0),
      }));
    return uniqArtists
      .map((artist) => ({
        ...artist,
        viewCount: viewCountArrays.find((v) => v.id === artist.id)?.viewCount,
      }))
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0)) as ArtistPreview[];
  }, [albums]);

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

  if (albumsLoading || tracksLoading || lastfmLoading) {
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
              <Subheader
                text="About"
                onClick={() => setExpandedText(!expandedText)}
              />
              <Typography
                color="text.primary"
                fontFamily="Rubik"
                sx={{
                  display: '-webkit-box',
                  overflow: 'hidden',
                  WebkitBoxOrient: 'vertical',
                  WebkitLineClamp: expandedText ? Infinity : 3,
                  wordBreak: 'break-word',
                }}
              >
                {lastfmTag.wiki.content.split(' <')[0]}
              </Typography>
            </Box>
          )}
          {lastfmTag && lastfmTag.wiki.content.length === 0 && (
            <Box paddingTop="32px" />
          )}
          <AnimatePresence initial={false} mode="wait">
            {!!tracks && tracks.length > 0 && (
              <Box key={location.pathname}>
                <Subheader
                  text="Top Tracks"
                  onClick={() => {}}
                />
                <TrackCarousel
                  getFormattedTime={getFormattedTime}
                  isPlaying={isPlaying}
                  library={library}
                  nowPlaying={nowPlaying}
                  rows={4}
                  tracks={tracks}
                />
              </Box>
            )}
          </AnimatePresence>
          <AnimatePresence initial={false} mode="wait">
            <Box key={location.pathname}>
              <Subheader
                text="Top Artists"
                onClick={() => {}}
              />
              <ArtistCarousel
                artists={artists.slice(0, (grid.cols - 1) * 5)}
                cols={grid.cols - 1}
                library={library}
                navigate={navigate}
                width={width}
              />
            </Box>
          </AnimatePresence>
          <AnimatePresence initial={false} mode="wait">
            {!!albums && albums.length > 0 && (
              <Box key={location.pathname}>
                <Subheader
                  text="Top Albums"
                  onClick={() => {}}
                />
                <AlbumCarousel
                  albums={albums.slice(0, (grid.cols - 1) * 6)}
                  cols={grid.cols - 1}
                  library={library}
                  navigate={navigate}
                  width={width}
                />
              </Box>
            )}
          </AnimatePresence>
        </Box>
      </Box>
    </motion.div>
  );
};

export default Genre;
