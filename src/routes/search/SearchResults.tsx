import { Box } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useMemo, useRef } from 'react';
import { BiChevronRight } from 'react-icons/all';
import {
  Link,
  useLocation,
  useNavigate,
  useNavigationType,
  useOutletContext,
} from 'react-router-dom';
import { Album, Artist, Playlist, Track } from 'api/index';
import AlbumCarousel from 'components/album/AlbumCarousel';
import ArtistCarousel from 'components/artist/ArtistCarousel';
import { MotionTypography, MotionSvg } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PlaylistCarousel from 'components/playlist/PlaylistCarousel';
import TrackCarousel from 'components/track/TrackCarousel';
import { WIDTH_CALC } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import { useLibrary } from 'queries/app-queries';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { QueryKeys } from 'types/enums';
import { Result } from 'types/types';
import Header from './Header';
import TopResult from './TopResult';

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
  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();
  const { width } = useOutletContext() as { width: number };

  const urlParams = new URLSearchParams(location.search);
  const params = Object.fromEntries(urlParams.entries());

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
    const top = searchResults?.hubs
      .filter((hub) => hub.size > 0)[0].items[0] as Result;
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
          <Header query={params.query} />
          <Box
            display="flex"
            flexWrap="wrap"
          >
            <Box
              flex="1 1 500px"
              marginRight="8px"
              maxWidth={500}
              minHeight={width > 564 ? 295 : 223}
            >
              <Subheader text="Top Result" />
              <TopResult
                imgSize={width > 564 ? 295 - 71 - 12 : 140}
                topResult={topResult}
              />
            </Box>
            <Box
              flex="50000 1 600px"
              maxWidth={1}
              minHeight={Math.min(295, (tracks.length * 56) + 71)}
            >
              {showTracks() && (
                <>
                  <Subheader text="Tracks" />
                  <TrackCarousel
                    getFormattedTime={getFormattedTime}
                    isPlaying={isPlaying}
                    library={library}
                    nowPlaying={nowPlaying}
                    rows={4}
                    tracks={tracks}
                  />
                </>
              )}
            </Box>
          </Box>
          {showArtists() && (
            <>
              <Subheader text="Artists" />
              <ArtistCarousel
                artists={artists}
                library={library}
                navigate={navigate}
                width={width}
              />
            </>
          )}
          {showAlbums() && (
            <>
              <Subheader text="Albums" />
              <AlbumCarousel
                albums={albums}
                library={library}
                navigate={navigate}
                width={width}
              />
            </>
          )}
          {showPlaylists() && (
            <>
              <Subheader text="Playlists" />
              <PlaylistCarousel
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
