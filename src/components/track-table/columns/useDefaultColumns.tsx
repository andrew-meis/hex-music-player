import { SvgIcon, Typography } from '@mui/material';
import { ColumnDef, createColumnHelper } from '@tanstack/react-table';
import moment from 'moment';
import { useMemo } from 'react';
import { RiHeartLine, RiTimeLine } from 'react-icons/ri';
import { Link, NavLink } from 'react-router-dom';
import { Library, PlayQueueItem, Track } from 'api/index';
import { SubtextOptions } from 'components/subtext/Subtext';
import { IndexCell, ParentIndexCell, RatingCell, ThumbCell, TitleCell } from '../cells';

const columnHelper = createColumnHelper<Track>();

const iconSx = {
  color: 'text.secondary',
  height: 18,
  width: 18,
};

const formatPlaycount = (x: number) => {
  switch (true) {
    case x === 1:
      return `${x} play`;
    case x > 1:
      return `${x} plays`;
    default:
      return 'unplayed';
  }
};

const useDefaultColumns = ({
  additionalColumns,
  isPlaying,
  library,
  nowPlaying,
  ratingOptions,
  titleOptions,
  useTrackNumber,
}: {
  additionalColumns: ColumnDef<Track, any>[],
  isPlaying: boolean,
  library: Library,
  nowPlaying: PlayQueueItem | undefined,
  ratingOptions: boolean,
  titleOptions: SubtextOptions,
  useTrackNumber?: boolean,
}): ColumnDef<Track, any>[] => useMemo(() => ([
  columnHelper.accessor('parentIndex', {
    cell: (info) => <ParentIndexCell info={info} />,
    header: '',
    enableSorting: false,
  }),
  columnHelper.accessor('index', {
    cell: (info) => (
      <IndexCell
        index={useTrackNumber ? info.getValue() : info.row.index + 1}
        isPlaying={isPlaying}
        playing={nowPlaying?.track.id === info.row.original.id}
      />
    ),
    header: '',
    enableSorting: false,
  }),
  columnHelper.accessor('thumb', {
    cell: (info) => (
      <ThumbCell
        isIndexVisible={info.table.getColumn('index')?.getIsVisible() || false}
        isPlaying={isPlaying}
        library={library}
        playing={nowPlaying?.track.id === info.row.original.id}
        track={info.row.original}
      />
    ),
    header: '',
    enableSorting: false,
  }),
  columnHelper.accessor('title', {
    cell: (info) => (
      <TitleCell
        options={titleOptions}
        playing={nowPlaying?.track.id === info.row.original.id}
        track={info.row.original}
      />
    ),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Title
      </Typography>
    ),
    sortingFn: 'alphanumeric',
  }),
  columnHelper.accessor('grandparentTitle', {
    cell: (info) => {
      const track = info.row.original;
      return (
        <NavLink
          className="link"
          state={{
            guid: track.grandparentGuid,
            title: track.grandparentTitle,
          }}
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/artists/${track.grandparentId}`}
          onClick={(event) => event.stopPropagation()}
        >
          {info.getValue()}
        </NavLink>
      );
    },
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Album Artist
      </Typography>
    ),
    sortingFn: 'alphanumeric',
  }),
  columnHelper.accessor('originalTitle', {
    cell: (info) => {
      const track = info.row.original;
      return (
        <NavLink
          className="link"
          state={{
            guid: track.grandparentGuid,
            title: track.grandparentTitle,
          }}
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/artists/${track.grandparentId}`}
          onClick={(event) => event.stopPropagation()}
        >
          {info.getValue() || track.grandparentTitle}
        </NavLink>
      );
    },
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Track Artist
      </Typography>
    ),
    sortingFn: 'alphanumeric',
  }),
  columnHelper.accessor('parentTitle', {
    cell: (info) => (
      <NavLink
        className="link"
        style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
        to={`/albums/${info.row.original.parentTitle}`}
        onClick={(event) => event.stopPropagation()}
      >
        {info.getValue()}
      </NavLink>
    ),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Album
      </Typography>
    ),
    sortingFn: 'alphanumeric',
  }),
  columnHelper.accessor('viewCount', {
    cell: (info) => (
      <Link className="link" to={`/history/${info.row.original.id}`}>
        {info.row.original.globalViewCount
          ? formatPlaycount(info.row.original.globalViewCount)
          : formatPlaycount(info.getValue())}
      </Link>
    ),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Playcount
      </Typography>
    ),
    sortUndefined: -1,
  }),
  columnHelper.accessor('lastViewedAt', {
    cell: (info) => (
      <Link className="link" to={`/history/${info.row.original.id}`}>
        {info.getValue() ? moment(info.getValue()).fromNow() : 'unplayed'}
      </Link>
    ),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Last Played
      </Typography>
    ),
    sortUndefined: -1,
  }),
  ...additionalColumns || [],
  columnHelper.accessor('parentYear', {
    cell: (info) => (info.getValue()),
    header: () => (
      <Typography color="text.secondary" lineHeight="24px" variant="overline">
        Year
      </Typography>
    ),
  }),
  columnHelper.accessor('userRating', {
    cell: (info) => (
      <RatingCell
        library={library}
        showAdditionalRow={ratingOptions}
        track={info.row.original}
      />
    ),
    header: () => <SvgIcon sx={iconSx}><RiHeartLine /></SvgIcon>,
    sortUndefined: -1,
  }),
  columnHelper.accessor('duration', {
    cell: (info) => moment.utc(info.getValue()).format('mm:ss'),
    header: () => <SvgIcon sx={iconSx}><RiTimeLine /></SvgIcon>,
  }),
]), [
  additionalColumns,
  isPlaying,
  library,
  nowPlaying?.track.id,
  ratingOptions,
  titleOptions,
  useTrackNumber,
]);

export default useDefaultColumns;
