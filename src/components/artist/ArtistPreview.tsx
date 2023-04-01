import { Box, Typography } from '@mui/material';
import { UseQueryResult } from '@tanstack/react-query';
import { BiChevronRight } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { Album, Artist, Hub, Library, PlayQueueItem, Track } from 'api/index';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import TrackCarousel from 'components/track/TrackCarousel';
import { PlayParams } from 'hooks/usePlayback';
import { thresholds } from 'routes/artist/Header';
import { PlayActions } from 'types/enums';

interface ArtistPreviewProps {
  getFormattedTime: (inMs: number) => string;
  height: number;
  isPlaying: boolean;
  library: Library,
  nowPlaying: PlayQueueItem | undefined;
  openArtist: Pick<Artist, 'id' | 'guid' | 'title'>;
  openArtistQuery: UseQueryResult<{albums: Album[], artist: Artist, hubs: Hub[]}>,
  openArtistTracksQuery: UseQueryResult<Track[]>;
  playSwitch: (action: PlayActions, params: PlayParams) => Promise<void>;
}

const ArtistPreview = ({
  getFormattedTime,
  height,
  isPlaying,
  library,
  nowPlaying,
  openArtist,
  openArtistQuery,
  openArtistTracksQuery,
  playSwitch,
}: ArtistPreviewProps) => {
  const { ref, entry } = useInView({ threshold: thresholds });

  const handlePlay = () => playSwitch(
    PlayActions.PLAY_ARTIST,
    { artist: openArtistQuery.data?.artist, shuffle: false },
  );
  const handleShuffle = () => playSwitch(
    PlayActions.PLAY_ARTIST,
    { artist: openArtistQuery.data?.artist, shuffle: true },
  );
  const handleRadio = () => playSwitch(
    PlayActions.PLAY_ARTIST_RADIO,
    { artist: openArtistQuery.data?.artist },
  );

  return (
    <Box
      alignContent="flex-start"
      display="flex"
      flexWrap="wrap"
      height={1}
      margin="auto"
      width="calc(100% - 64px)"
    >
      <Box
        position="absolute"
        right={32}
        top={8}
      >
        <PlayShuffleButton
          handlePlay={handlePlay}
          handleRadio={handleRadio}
          handleShuffle={handleShuffle}
        />
      </Box>
      <Box
        alignItems="center"
        color="text.primary"
        display="flex"
        width={1}
      >
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
            state={{
              guid: openArtistQuery.data!.artist.guid,
              title: openArtistQuery.data!.artist.title,
            }}
            to={`/artists/${openArtist.id}`}
          >
            {openArtistQuery.data!.artist.title}
            <MotionSvg variants={iconMotion} viewBox="0 -5 24 24">
              <BiChevronRight />
            </MotionSvg>
          </Link>
        </MotionTypography>
      </Box>
      <Typography color="text.primary" fontFamily="TT Commons" fontSize="1.3rem" width={1}>
        Top Tracks
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        ref={ref}
      >
        {
          entry && entry.intersectionRatio > 0.3
            ? (
              <TrackCarousel
                getFormattedTime={getFormattedTime}
                isPlaying={isPlaying}
                library={library}
                nowPlaying={nowPlaying}
                playSwitch={playSwitch}
                rows={height < 639 ? 3 : 4}
                tracks={openArtistTracksQuery.data!}
              />
            )
            : (
              <Box height={224} width={1} />
            )
        }
      </Box>
    </Box>
  );
};

export default ArtistPreview;
