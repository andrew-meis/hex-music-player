import { Avatar, Box, Typography } from '@mui/material';
import moment from 'moment';
import { Link, NavLink } from 'react-router-dom';
import { Library, Track } from 'api/index';
import PlayingAnimation from 'components/playing-animation/PlayingAnimation';
import TrackRating from 'components/rating/TrackRating';
import Subtext from 'components/subtext/Subtext';
import { typographyStyle } from 'constants/style';
import { HexSortKeys, TrackSortKeys } from 'types/enums';

const getMetaText = (
  metaText: string | undefined,
  track: Track,
  originallyAvailableAt: Date | undefined,
) => {
  if (track.globalViewCount) {
    return `${track.globalViewCount} ${track.globalViewCount > 1 ? 'plays' : 'play'}`;
  }
  if (metaText === TrackSortKeys.ADDED_AT || metaText === HexSortKeys.ADDED_AT) {
    return moment(track.addedAt).fromNow();
  }
  if (metaText === TrackSortKeys.LAST_PLAYED) {
    if (!track.lastViewedAt) return 'unplayed';
    return moment(track.lastViewedAt).fromNow();
  }
  if (metaText === TrackSortKeys.LAST_RATED) {
    if (!track.lastRatedAt) return 'never rated';
    return moment(track.lastRatedAt).fromNow();
  }
  if (metaText === TrackSortKeys.POPULARITY) {
    return track.ratingCount
      ? `${track.ratingCount.toLocaleString()} ${track.ratingCount > 1 ? 'listeners' : 'listener'}`
      : 'no listeners';
  }
  if (metaText === TrackSortKeys.RELEASE_DATE && !!originallyAvailableAt) {
    return moment.utc(originallyAvailableAt).format('DD MMM YYYY');
  }
  if (metaText === 'parentYear') {
    return track.parentYear;
  }
  return (
    <Link className="link" to={`/history/${track.id}`}>
      {
        track.viewCount
          ? `${track.viewCount} ${track.viewCount > 1 ? 'plays' : 'play'}`
          : 'unplayed'
      }
    </Link>
  );
};

interface TrackRowOptions {
  metaText?: string;
  originallyAvailableAt?: Date;
  showAlbumTitle: boolean;
  showArtwork: boolean;
}

interface TrackRowProps {
  getFormattedTime: (inMs: number) => string;
  index?: number | undefined;
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
    {index && (
      <Box
        display="flex"
        flexShrink={0}
        justifyContent="center"
        mr="8px"
        textAlign="center"
        width={40}
      >
        {playing && isPlaying
          ? (<PlayingAnimation />)
          : (<Typography fontSize="0.95rem">{index}</Typography>)}
      </Box>
    )}
    {options.showArtwork && (
      <Avatar
        alt={track.title}
        src={library.api.getAuthenticatedUrl(
          '/photo/:/transcode',
          {
            url: track.thumb, width: 100, height: 100, minSize: 1, upscale: 1,
          },
        )}
        variant="rounded"
      />
    )}
    {!index && playing && isPlaying && (
      <Box
        alignItems="center"
        bgcolor="rgba(0,0,0,0.4)"
        borderRadius="4px"
        display="flex"
        height={40}
        left={10}
        position="absolute"
        width={40}
      >
        <PlayingAnimation />
      </Box>
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
        alignItems="center"
        display="flex"
        height={20}
        justifyContent="space-between"
      >
        <Typography
          color="text.primary"
          fontFamily="Rubik, sans-serif"
          fontSize="0.95rem"
          fontWeight={playing ? 600 : 'inherit'}
          sx={typographyStyle}
        >
          <NavLink
            className="link"
            style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
            to={`/tracks/${track.id}`}
          >
            {track.title}
          </NavLink>
        </Typography>
        <Box
          height={20}
          marginLeft="8px"
        >
          <TrackRating
            id={track.id}
            library={library}
            userRating={track.userRating / 2 || 0}
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
          lineHeight="20px"
          marginLeft="8px"
          minWidth={80}
          textAlign="right"
        >
          {getMetaText(options?.metaText, track, options?.originallyAvailableAt)}
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

TrackRow.defaultProps = {
  index: undefined,
};

export default TrackRow;
