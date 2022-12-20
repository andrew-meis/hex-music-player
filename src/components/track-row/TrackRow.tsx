import { Avatar, Box, Typography } from '@mui/material';
import { Library, Track } from 'hex-plex';
import moment from 'moment';
import PlayingAnimation from 'components/playing-animation/PlayingAnimation';
import TrackRating from 'components/rating/TrackRating';
import Subtext from 'components/subtext/Subtext';
import { typographyStyle } from 'constants/style';
import { PlexSortKeys } from 'types/enums';

const getMetaText = (metaText: string, track: Track, originallyAvailableAt?: Date) => {
  if (track.globalViewCount) {
    return `${track.globalViewCount} ${track.globalViewCount > 1 ? 'plays' : 'play'}`;
  }
  if (metaText === PlexSortKeys.ADDED_AT) {
    if (!track.lastViewedAt) return 'unplayed';
    return moment(track.addedAt).fromNow();
  }
  if (metaText === PlexSortKeys.LAST_PLAYED) {
    if (!track.lastViewedAt) return 'unplayed';
    return moment(track.lastViewedAt).fromNow();
  }
  if (metaText === PlexSortKeys.POPULARITY) {
    return track.ratingCount
      ? `${track.ratingCount.toLocaleString()} ${track.ratingCount > 1 ? 'listeners' : 'listener'}`
      : 'no listeners';
  }
  if (metaText === PlexSortKeys.RELEASE_DATE) {
    return moment(originallyAvailableAt).format('DD MMM YYYY');
  }
  return track.viewCount
    ? `${track.viewCount} ${track.viewCount > 1 ? 'plays' : 'play'}`
    : 'unplayed';
};

interface TrackRowOptions {
  metaText: string;
  originallyAvailableAt: Date;
  showAlbumTitle: boolean;
  showArtwork: boolean;
}

interface TrackRowProps {
  getFormattedTime: (inMs: number) => string;
  index: number;
  isPlaying: boolean;
  library: Library;
  options: TrackRowOptions;
  playing: boolean;
  track: Track;
}

const TrackRow = ({
  getFormattedTime, index, isPlaying, library, options, playing, track,
}: TrackRowProps) => (
  <>
    <Box maxWidth="10px" width="10px" />
    <Box
      display="flex"
      flexShrink={0}
      justifyContent="center"
      textAlign="center"
      width={40}
    >
      {playing && isPlaying
        ? (<PlayingAnimation />)
        : (<Typography fontSize="0.95rem">{index}</Typography>)}
    </Box>
    {options.showArtwork && (
      <Avatar
        alt={track.title}
        src={library.api.getAuthenticatedUrl(
          '/photo/:/transcode',
          {
            url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
          },
        )}
        sx={{ marginLeft: '8px' }}
        variant="rounded"
      />
    )}
    <Box
      display="table"
      flexGrow={1}
      sx={{
        marginLeft: '8px',
        tableLayout: 'fixed',
      }}
      width={0.5}
    >
      <Box
        alignItems="baseline"
        display="flex"
        height={20}
        justifyContent="space-between"
      >
        <Typography
          color="text.primary"
          fontFamily="Rubik"
          fontSize="0.95rem"
          fontWeight={playing ? 600 : 'inherit'}
          sx={typographyStyle}
        >
          {track.title}
        </Typography>
        <Box
          marginLeft="8px"
        >
          <TrackRating
            id={track.id}
            userRating={track.userRating}
          />
        </Box>
      </Box>
      <Box
        alignItems="center"
        display="flex"
        height={20}
        justifyContent="space-between"
      >
        <Typography fontSize="0.875rem" sx={typographyStyle}>
          <Subtext showAlbum={options.showAlbumTitle} track={track} />
        </Typography>
        <Typography
          flexShrink={0}
          fontSize="0.875rem"
          marginLeft="8px"
          minWidth={80}
          textAlign="right"
        >
          {getMetaText(options.metaText, track, options.originallyAvailableAt)}
        </Typography>
      </Box>
    </Box>
    <Box
      sx={{
        width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
      }}
    >
      <Typography fontSize="0.95rem">
        {getFormattedTime(track.duration)}
      </Typography>
    </Box>
    <Box maxWidth="10px" width="10px" />
  </>
);

export default TrackRow;
