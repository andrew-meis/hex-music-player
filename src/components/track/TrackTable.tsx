import {
  ClickAwayListener, SvgIcon, Typography,
} from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import {
  GroupingState,
  Row,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty, range } from 'lodash';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { RiHeartLine, RiTimeLine } from 'react-icons/ri';
import { Link, NavLink } from 'react-router-dom';
import {
  ItemProps,
  ScrollSeekPlaceholderProps,
  TableProps,
  TableVirtuoso,
} from 'react-virtuoso';
import { Library, Track } from 'api/index';
import { TrackMenu } from 'components/menus';
import { SubtextOptions } from 'components/subtext/Subtext';
import { WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { ParentIndexCell, IndexCell, ThumbCell, TitleCell, RatingCell } from './cells';
import { ColumnVisibilityDialog, TableSettings } from './column-headers';
import TrackPlaceholder from './TrackPlaceholder';
import styles from './TrackTable.module.scss';
import TrackTableRow from './TrackTableRow';

const columnHelper = createColumnHelper<Track>();

const iconSx = {
  color: 'text.secondary',
  height: 18,
  width: 18,
};

const TrackTable: React.FC<{
  columnOptions: Partial<Record<keyof Track, boolean>>,
  groupBy: 'parentIndex' | '',
  isViewCompact: boolean,
  library: Library,
  multiLineRating: boolean,
  scrollRef: HTMLDivElement | null,
  subtextOptions: SubtextOptions,
  tracks: Track[],
}> = ({
  columnOptions,
  groupBy,
  isViewCompact,
  library,
  multiLineRating,
  scrollRef,
  subtextOptions,
  tracks,
}) => {
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [compact, setCompact] = useState(isViewCompact);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const [open, setOpen] = useState(false);
  const [ratingOptions, setRatingOptions] = useState(multiLineRating);
  const [titleOptions, setTitleOptions] = useState<SubtextOptions>(subtextOptions);
  const { playSwitch } = usePlayback();

  const { data: isPlaying } = useIsPlaying();
  const { data: nowPlaying } = useNowPlaying();
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({
    ...columnOptions,
  });
  const [grouping, setGrouping] = useState<GroupingState>([groupBy]);
  const [rowSelection, setRowSelection] = useState({});
  const selectedTracks = useMemo(() => Object.keys(rowSelection)
    .map((i) => tracks[+i]), [tracks, rowSelection]);

  const columns = useMemo(() => [
    columnHelper.accessor('parentIndex', {
      cell: (info) => (<ParentIndexCell info={info} />),
      header: '',
    }),
    columnHelper.accessor('index', {
      cell: (info) => (
        <IndexCell
          info={info}
          isPlaying={isPlaying}
          playing={nowPlaying?.track.id === info.row.original.id}
        />
      ),
      header: '',
    }),
    columnHelper.accessor('thumb', {
      cell: (info) => (<ThumbCell library={library} track={info.row.original} />),
      header: '',
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
    }),
    columnHelper.accessor('grandparentTitle', {
      cell: (info) => (
        <NavLink
          className="link"
          state={{
            guid: info.row.original.grandparentGuid,
            title: info.row.original.grandparentTitle,
          }}
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/artists/${info.row.original.grandparentId}`}
          onClick={(event) => event.stopPropagation()}
        >
          {info.getValue()}
        </NavLink>
      ),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Album Artist
        </Typography>
      ),
    }),
    columnHelper.accessor('originalTitle', {
      cell: (info) => (
        <NavLink
          className="link"
          state={{
            guid: info.row.original.grandparentGuid,
            title: info.row.original.grandparentTitle,
          }}
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/artists/${info.row.original.grandparentId}`}
          onClick={(event) => event.stopPropagation()}
        >
          {info.getValue() || info.row.original.grandparentTitle}
        </NavLink>
      ),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Track Artist
        </Typography>
      ),
    }),
    columnHelper.accessor('parentTitle', {
      cell: (info) => (
        <NavLink
          className="link"
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/albums/${info.row.original.parentId}`}
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
    }),
    columnHelper.accessor('viewCount', {
      cell: (info) => (
        <Link className="link" to={`/history/${info.row.original.id}`}>
          {
            info.getValue()
              ? `${info.getValue()} ${info.getValue() > 1
                ? 'plays'
                : 'play'}`
              : 'unplayed'
          }
        </Link>
      ),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Playcount
        </Typography>
      ),
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
    }),
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
    }),
    columnHelper.accessor('duration', {
      cell: (info) => moment.utc(info.getValue()).format('mm:ss'),
      header: () => <SvgIcon sx={iconSx}><RiTimeLine /></SvgIcon>,
    }),
  ], [isPlaying, library, nowPlaying?.track.id, ratingOptions, titleOptions]);

  const table = useReactTable({
    columns,
    data: tracks,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      expanded: true,
      grouping,
      rowSelection,
    },
  });

  const handleContextMenu = useCallback((
    event: React.MouseEvent<Element>,
    row: Row<Track>,
  ) => {
    event.preventDefault();
    const track = row.original;
    switch (true) {
      case selectedTracks.length === 0:
        row.toggleSelected();
        break;
      case selectedTracks.length === 1 && !selectedTracks.map(({ id }) => id).includes(track.id):
        table.setRowSelection({ [row.id]: true });
        break;
      case selectedTracks.length > 1 && !selectedTracks.map(({ id }) => id).includes(track.id):
        table.setRowSelection({ [row.id]: true });
        break;
      default:
        break;
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedTracks, table, toggleMenu]);

  const handleDragEnd = () => {
    table.toggleAllRowsSelected(false);
  };

  const handleDragStart = useCallback((row: Row<Track>) => {
    const { original: track } = row;
    const nodes = document.querySelectorAll('tr.track-table-row');
    nodes.forEach((node) => node.classList.add(styles['row-non-dragged']));
    if (selectedTracks.length > 1 && selectedTracks.map(({ id }) => id).includes(track.id)) {
      const draggedNodes = selectedTracks.map(({ id }) => document
        .querySelector(`tr.track-table-row[data-track-id='${id}'`));
      draggedNodes.forEach((node) => node?.classList.add(styles['row-dragged']));
    } else {
      const draggedNode = document.querySelector(`tr.track-table-row[data-track-id='${track.id}'`);
      draggedNode?.classList.add(styles['row-dragged']);
    }
  }, [selectedTracks]);

  const handleClick = useCallback((event: React.MouseEvent, row: Row<Track>) => {
    if (event.button !== 0) return;
    const { id } = row.original;
    const selectedIds = selectedTracks.map((track) => track.id);
    if (event.ctrlKey || event.metaKey) {
      row.toggleSelected();
      return;
    }
    if (event.shiftKey) {
      if (isEmpty(selectedIds)) {
        const newRowSelection = range(0, row.index + 1)
          .reduce((o, key) => Object.assign(o, { [key]: true }), {});
        table.setRowSelection(newRowSelection);
        return;
      }
      if (row.index < Math.min(...Object.keys(rowSelection).map((i) => parseInt(i, 10)))) {
        const newRowSelection = range(
          row.index,
          Math.max(...Object.keys(rowSelection).map((i) => parseInt(i, 10))) + 1,
        ).reduce((o, key) => Object.assign(o, { [key]: true }), {});
        table.setRowSelection(newRowSelection);
        return;
      }
      if (row.index > Math.max(...Object.keys(rowSelection).map((i) => parseInt(i, 10)))) {
        const newRowSelection = range(
          Math.min(...Object.keys(rowSelection).map((i) => parseInt(i, 10))),
          row.index + 1,
        ).reduce((o, key) => Object.assign(o, { [key]: true }), {});
        table.setRowSelection(newRowSelection);
        return;
      }
    }
    if (selectedIds.length === 1 && selectedIds.includes(id)) {
      row.toggleSelected();
      return;
    }
    table.setRowSelection({ [row.id]: true });
  }, [rowSelection, selectedTracks, table]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  return (
    <>
      <TableVirtuoso
        useWindowScroll
        components={{
          ScrollSeekPlaceholder: ({ index }: ScrollSeekPlaceholderProps) => {
            const row = table.getRowModel().rows[index];
            return (
              <TrackPlaceholder
                columns={table.getVisibleLeafColumns()}
                compact={compact}
                isGrouped={row.getIsGrouped()}
                singleLineRating={!ratingOptions}
                singleLineTitle={!titleOptions.showSubtext}
              />
            );
          },
          Table: ({ style, ...props }: TableProps) => (
            <ClickAwayListener onClickAway={() => table.resetRowSelection()}>
              <table
                {...props}
                className="track-table"
                style={{
                  ...style,
                  color: 'white',
                  margin: 'auto',
                  width: WIDTH_CALC,
                  tableLayout: 'fixed',
                }}
              />
            </ClickAwayListener>
          ),
          TableRow: ({ ...props }: ItemProps<Track>) => {
            const next = table.getRowModel().rows[props['data-index'] + 1];
            const prev = table.getRowModel().rows[props['data-index'] - 1];
            const row = table.getRowModel().rows[props['data-index']];
            return (
              <TrackTableRow
                compact={compact}
                data-selected-above={prev?.getIsSelected() || false}
                data-selected-below={next?.getIsSelected() || false}
                row={row}
                selectedTracks={selectedTracks}
                onClick={(e) => handleClick(e, row)}
                onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, row)}
                onDragEnd={handleDragEnd}
                onDragStart={() => handleDragStart(row)}
                {...props}
              />
            );
          },
        }}
        customScrollParent={scrollRef || undefined}
        fixedHeaderContent={() => (
          <>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index, array) => (
                  <th
                    className={styles[header.column.id]}
                    colSpan={header.colSpan}
                    key={header.id}
                    style={{
                      background: 'var(--mui-palette-background-paper)',
                      textAlign: (index === 0 && array[1]?.column.columnDef.header !== '')
                        ? 'left' : undefined,
                      width: (index === 0 && array[1]?.column.columnDef.header !== '') ? 26 : '',
                    }}
                  >
                    {index === 0 && (
                      <TableSettings setOpen={setOpen} />
                    )}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </>
        )}
        fixedItemHeight={compact ? 40 : 56}
        isScrolling={handleScrollState}
        itemContent={(index) => {
          const row = table.getRowModel().rows[index];
          if (row.getIsGrouped()) {
            const cell = row.getVisibleCells().find(({ column }) => column.id === 'parentIndex')!;
            return (
              <td className={styles[cell.column.id]} colSpan={100} key={cell.id}>
                {flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
              </td>
            );
          }
          return row.getVisibleCells()
            .filter(({ column }) => !['options', 'parentIndex'].includes(column.id))
            .map((cell, cellIndex) => (
              <td
                className={styles[cell.column.id]}
                colSpan={cellIndex === 0 ? 2 : 1}
                key={cell.id}
              >
                {cell.getIsAggregated() ? null : flexRender(
                  cell.column.columnDef.cell,
                  cell.getContext(),
                )}
              </td>
            ));
        }}
        key={`${compact}`}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 500,
          exit: (velocity) => Math.abs(velocity) < 100,
        }}
        totalCount={table.getRowModel().rows.length}
      />
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedTracks}
        onClose={() => {
          toggleMenu(false);
          table.resetRowSelection();
        }}
        {...menuProps}
      />
      <ColumnVisibilityDialog
        compact={compact}
        open={open}
        ratingOptions={ratingOptions}
        setCompact={setCompact}
        setOpen={setOpen}
        setRatingOptions={setRatingOptions}
        setTitleOptions={setTitleOptions}
        table={table}
        titleOptions={titleOptions}
      />
    </>
  );
};

export default TrackTable;
