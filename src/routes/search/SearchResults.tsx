import { Box, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Album, Artist, Playlist, Track } from 'hex-plex';
import { throttle } from 'lodash';
import { useMemo, useRef } from 'react';
import { BiChevronRight } from 'react-icons/all';
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
} from 'react-router-dom';
import AlbumHighlights from 'components/album-highlights/AlbumHighlights';
import ArtistHighlights from 'components/artist-highlights/ArtistHighlights';
import { MotionTypography, MotionSvg } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PlaylistHighlights from 'components/playlist-highlights/PlaylistHighlights';
import TrackCarousel from 'components/track-highlights/TrackCarousel';
import { WIDTH_CALC } from 'constants/measures';
import { useLibrary } from 'queries/app-queries';
import { QueryKeys } from 'types/enums';
import { Result } from 'types/types';
import TopResult from './TopResult';

const getCols = (width: number) => {
  if (width >= 1350) {
    return 6;
  }
  if (width < 1350 && width >= 1100) {
    return 5;
  }
  if (width < 1100 && width >= 850) {
    return 4;
  }
  if (width < 850 && width >= 650) {
    return 3;
  }
  if (width < 650) {
    return 2;
  }
  return 4;
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

const SearchResults = () => {
  const box = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const library = useLibrary();
  const navigate = useNavigate();
  const navigationType = useNavigationType();
  const { width } = useOutletContext() as { width: number };

  const urlParams = new URLSearchParams(location.search);
  const params = Object.fromEntries(urlParams.entries());

  const throttledCols = throttle(() => getCols(width), 300, { leading: true });
  const grid = useMemo(() => ({ cols: throttledCols() as number }), [throttledCols]);

  const { data: searchResults, isLoading } = useQuery(
    [QueryKeys.SEARCH_PAGE, params.query],
    () => library.searchAll(params.query, 30),
    {
      enabled: params.query.length > 1,
      refetchOnWindowFocus: false,
    },
  );

  const [artists, albums, tracks, playlists, topResult] = useMemo(() => {
    const artistsArray = searchResults?.hubs
      .find((hub) => hub.type === 'artist')?.items as Artist[];
    const albumsArray = searchResults?.hubs
      .find((hub) => hub.type === 'album')?.items as Album[];
    const tracksArray = searchResults?.hubs
      .find((hub) => hub.type === 'track')?.items as Track[];
    const playlistsArray = searchResults?.hubs
      .find((hub) => hub.type === 'playlist')?.items as Playlist[];
    const top = searchResults?.hubs[0].items[0] as Result;
    return [
      artistsArray,
      albumsArray,
      tracksArray,
      playlistsArray,
      top,
    ];
  }, [searchResults]);

  const showArtists = () => {
    if (artists.length === 0) return false;
    if (artists.length === 1 && artists.includes(topResult as Artist)) return false;
    return true;
  };

  const showAlbums = () => {
    if (albums.length === 0) return false;
    if (albums.length === 1 && albums.includes(topResult as Album)) return false;
    return true;
  };

  const showTracks = () => {
    if (tracks.length === 0) return false;
    if (tracks.length === 1 && tracks.includes(topResult as Track)) return false;
    return true;
  };

  const showPlaylists = () => {
    if (playlists.length === 0) return false;
    if (playlists.length === 1 && playlists.includes(topResult as Playlist)) return false;
    return true;
  };

  const initialScrollTop = useMemo(() => {
    let top;
    top = sessionStorage.getItem(`search-scroll ${params.query}`);
    if (!top) return 0;
    top = parseInt(top, 10);
    if (navigationType === 'POP') {
      return top;
    }
    sessionStorage.setItem(
      `search-scroll ${params.query}`,
      0 as unknown as string,
    );
    return 0;
  }, [navigationType, params]);

  if (!searchResults || Array.isArray(searchResults) || isLoading) {
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
            `search-scroll ${location.pathname}`,
            target.scrollTop as unknown as string,
          );
        }}
      >
        <Box
          maxWidth="1600px"
          mb="1px"
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
            <Typography variant="h1">Search</Typography>
          </Box>
          <Box
            display="flex"
            flexWrap="wrap"
          >
            <Box
              flex="1 1 500px"
              marginRight="8px"
              maxWidth={1}
              minHeight={295}
              minWidth={500}
            >
              <Subheader text="Top Result" />
              <TopResult topResult={topResult} />
            </Box>
            <Box
              flex="50000 1 600px"
              maxWidth={1}
              minHeight={295}
              minWidth={600}
            >
              {showTracks() && (
                <>
                  <Subheader text="Tracks" />
                  <TrackCarousel
                    library={library}
                    tracks={tracks}
                  />
                </>
              )}
            </Box>
          </Box>
          {showArtists() && (
            <>
              <Subheader text="Artists" />
              <ArtistHighlights
                artists={artists}
                cols={grid.cols}
                library={library}
                navigate={navigate}
                width={width}
              />
            </>
          )}
          {showAlbums() && (
            <>
              <Subheader text="Albums" />
              <AlbumHighlights
                albums={albums}
                cols={grid.cols}
                library={library}
                navigate={navigate}
                width={width}
              />
            </>
          )}
          {showPlaylists() && (
            <>
              <Subheader text="Playlists" />
              <PlaylistHighlights
                cols={grid.cols}
                library={library}
                navigate={navigate}
                playlists={playlists}
                width={width}
              />
            </>
          )}
        </Box>
      </Box>
    </motion.div>
  );
};

export default SearchResults;
