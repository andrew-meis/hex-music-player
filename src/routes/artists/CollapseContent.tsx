import { Box, Typography } from '@mui/material';
import { BiChevronRight } from 'react-icons/all';
import { useInView } from 'react-intersection-observer';
import { Link } from 'react-router-dom';
import { MotionSvg, MotionTypography } from 'components/motion-components/motion-components';
import { iconMotion } from 'components/motion-components/motion-variants';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import TrackHighlights from 'components/track-highlights/TrackHighlights';
import { thresholds } from 'routes/artist/Header';
import { PlayActions } from 'types/enums';
import { ArtistsContext } from './Artists';

interface CollapseContentProps {
  context: ArtistsContext;
}

const CollapseContent = ({ context }: CollapseContentProps) => {
  const { ref, entry } = useInView({ threshold: thresholds });
  const {
    getFormattedTime,
    height,
    isPlaying,
    library,
    nowPlaying,
    openArtist,
    openArtistQuery,
    openArtistTracksQuery,
    playSwitch,
  } = context;

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
              <TrackHighlights
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

export default CollapseContent;
