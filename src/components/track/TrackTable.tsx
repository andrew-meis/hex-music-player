import { ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import {
  GroupingState,
  Row,
  SortingState,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { isEmpty, isEqual, range } from 'lodash';
import moment from 'moment';
import React, { useCallback, useMemo, useState } from 'react';
import { BsArrowDownShort, BsArrowUpShort } from 'react-icons/bs';
import { RiHeartLine, RiTimeLine } from 'react-icons/ri';
import { Link, NavLink } from 'react-router-dom';
import { useKey } from 'react-use';
import {
  ItemProps,
  ScrollSeekPlaceholderProps,
  TableProps,
  TableVirtuoso,
} from 'react-virtuoso';
import { Library, PlaylistItem, Track } from 'api/index';
import { TrackMenu } from 'components/menus';
import { SubtextOptions } from 'components/subtext/Subtext';
import { WIDTH_CALC } from 'constants/measures';
import usePlayback from 'hooks/usePlayback';
import { useIsPlaying } from 'queries/player-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { isTrack } from 'types/type-guards';
import { ParentIndexCell, IndexCell, ThumbCell, TitleCell, RatingCell } from './cells';
import { ColumnVisibilityDialog, TableSettings } from './column-headers';
import styles from './TrackTable.module.scss';
import TrackTableFooter from './TrackTableFooter';
import TrackTablePlaceholder from './TrackTablePlaceholder';
import TrackTableRow from './TrackTableRow';

const columnHelper = createColumnHelper<PlaylistItem | Track>();

const getTrack = (x: PlaylistItem | Track) => {
  if (isTrack(x)) return x;
  return x.track;
};

const getTracks = (x: (PlaylistItem | Track)[]) => x.map((value) => {
  if (isTrack(value)) return value;
  return value.track;
});

const iconSx = {
  color: 'text.secondary',
  height: 18,
  width: 18,
};

const TableFoot = React.forwardRef((
  { style, ...props }: TableProps,
  ref: React.ForwardedRef<HTMLTableSectionElement>,
) => (
  <tfoot
    {...props}
    ref={ref}
    style={{
      ...style,
      position: 'relative',
    }}
  />
));

const TrackTable: React.FC<{
  additionalMenuOptions?(selectedItems: (PlaylistItem | Track)[]): React.ReactNode;
  columnOptions: Partial<Record<keyof Track, boolean>>,
  groupBy?: keyof Track,
  isViewCompact: boolean,
  library: Library,
  multiLineRating: boolean,
  playbackFn: (
    key?: string,
    shuffle?: boolean,
    sortedItems?: (PlaylistItem | Track)[],
  ) => Promise<void>;
  rows: (PlaylistItem | Track)[],
  scrollRef: HTMLDivElement | null,
  subtextOptions: SubtextOptions,
  trackDropFn?: (droppedItems: PlaylistItem[], prevId?: number) => Promise<void>;
  onDeleteKey?: (selectedItems: (PlaylistItem | Track)[]) => void;
}> = ({
  additionalMenuOptions,
  columnOptions,
  groupBy,
  isViewCompact,
  library,
  multiLineRating,
  playbackFn,
  rows,
  scrollRef,
  subtextOptions,
  trackDropFn,
  onDeleteKey,
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

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ ...columnOptions });
  const [grouping, setGrouping] = useState<GroupingState>(groupBy ? [groupBy] : []);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const selectedItems = useMemo(() => Object.keys(rowSelection)
    .map((i) => rows[+i]), [rows, rowSelection]);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.parentIndex;
      return row.track.parentIndex;
    }, {
      id: 'parentIndex',
      cell: (info) => <ParentIndexCell info={info} />,
      header: '',
      enableSorting: false,
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.index;
      return 0;
    }, {
      id: 'index',
      cell: (info) => (
        <IndexCell
          index={isTrack(info.row.original) ? info.getValue() : info.row.index + 1}
          isPlaying={isPlaying}
          playing={nowPlaying?.track.id === getTrack(info.row.original).id}
        />
      ),
      header: '',
      enableSorting: false,
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.thumb;
      return row.track.thumb;
    }, {
      id: 'thumb',
      cell: (info) => (
        <ThumbCell
          isIndexVisible={info.table.getColumn('index')?.getIsVisible() || false}
          isPlaying={isPlaying}
          library={library}
          playing={nowPlaying?.track.id === getTrack(info.row.original).id}
          track={getTrack(info.row.original)}
        />
      ),
      header: '',
      enableSorting: false,
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.title;
      return row.track.title;
    }, {
      id: 'title',
      cell: (info) => (
        <TitleCell
          options={titleOptions}
          playing={nowPlaying?.track.id === getTrack(info.row.original).id}
          track={getTrack(info.row.original)}
        />
      ),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Title
        </Typography>
      ),
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.grandparentTitle;
      return row.track.grandparentTitle;
    }, {
      id: 'grandparentTitle',
      cell: (info) => {
        const track = getTrack(info.row.original);
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
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.originalTitle;
      return row.track.originalTitle;
    }, {
      id: 'originalTitle',
      cell: (info) => {
        const track = getTrack(info.row.original);
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
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.parentTitle;
      return row.track.parentTitle;
    }, {
      id: 'parentTitle',
      cell: (info) => (
        <NavLink
          className="link"
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/albums/${getTrack(info.row.original).parentTitle}`}
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
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.viewCount;
      return row.track.viewCount;
    }, {
      id: 'viewCount',
      cell: (info) => (
        <Link className="link" to={`/history/${getTrack(info.row.original).id}`}>
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
      sortUndefined: -1,
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.lastViewedAt;
      return row.track.lastViewedAt;
    }, {
      id: 'lastViewedAt',
      cell: (info) => (
        <Link className="link" to={`/history/${getTrack(info.row.original).id}`}>
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
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.parentYear;
      return row.track.parentYear;
    }, {
      id: 'parentYear',
      cell: (info) => (info.getValue()),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Year
        </Typography>
      ),
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.userRating;
      return row.track.userRating;
    }, {
      id: 'userRating',
      cell: (info) => (
        <RatingCell
          library={library}
          showAdditionalRow={ratingOptions}
          track={getTrack(info.row.original)}
        />
      ),
      header: () => <SvgIcon sx={iconSx}><RiHeartLine /></SvgIcon>,
      sortUndefined: -1,
    }),
    columnHelper.accessor((row) => {
      if (isTrack(row)) return row.duration;
      return row.track.duration;
    }, {
      id: 'duration',
      cell: (info) => moment.utc(info.getValue()).format('mm:ss'),
      header: () => <SvgIcon sx={iconSx}><RiTimeLine /></SvgIcon>,
    }),
  ], [isPlaying, library, nowPlaying?.track.id, ratingOptions, titleOptions]);

  const table = useReactTable({
    columns,
    data: rows,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getExpandedRowModel: getExpandedRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onGroupingChange: setGrouping,
    onRowSelectionChange: setRowSelection,
    onSortingChange: (newSort) => {
      setGrouping(groupBy ? [groupBy] : []);
      setSorting(newSort);
    },
    state: {
      columnVisibility,
      expanded: true,
      grouping,
      rowSelection,
      sorting,
    },
  });

  const handleClick = useCallback((event: React.MouseEvent, row: Row<PlaylistItem | Track>) => {
    if (event.button !== 0) return;
    if (event.detail === 2) {
      let sortedItems;
      if (!isEmpty(sorting)) {
        sortedItems = table.getSortedRowModel().flatRows
          .filter((flatRow) => !flatRow.getIsGrouped())
          .map(({ original }) => original);
      }
      playbackFn(getTrack(row.original).key, false, sortedItems);
    }
    const { id } = row.original;
    const selectedIds = selectedItems.map((item) => item.id);
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
  }, [playbackFn, rowSelection, selectedItems, sorting, table]);

  const handleContextMenu = useCallback((
    event: React.MouseEvent<Element>,
    row: Row<PlaylistItem | Track>,
  ) => {
    event.preventDefault();
    const { original } = row;
    switch (true) {
      case selectedItems.length === 0:
        row.toggleSelected();
        break;
      case selectedItems.length === 1 && !selectedItems.map(({ id }) => id).includes(original.id):
        table.setRowSelection({ [row.id]: true });
        break;
      case selectedItems.length > 1 && !selectedItems.map(({ id }) => id).includes(original.id):
        table.setRowSelection({ [row.id]: true });
        break;
      default:
        break;
    }
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  }, [selectedItems, table, toggleMenu]);

  const handleDragEnd = () => {
    table.toggleAllRowsSelected(false);
  };

  const handleDragStart = useCallback((row: Row<PlaylistItem | Track>) => {
    const { original } = row;
    const nodes = document.querySelectorAll('tr.track-table-row');
    nodes.forEach((node) => node.setAttribute('data-non-dragged', 'true'));
    if (selectedItems.length > 1 && selectedItems.map(({ id }) => id).includes(original.id)) {
      const draggedNodes = selectedItems.map(({ id }) => document
        .querySelector(`tr.track-table-row[data-row-id='${id}'`));
      draggedNodes.forEach((node) => node?.setAttribute('data-dragged', 'true'));
    } else {
      const draggedNode = document.querySelector(`tr.track-table-row[data-row-id='${original.id}'`);
      draggedNode?.setAttribute('data-dragged', 'true');
    }
  }, [selectedItems]);

  const handleScrollState = (isScrolling: boolean) => {
    if (isScrolling) {
      document.body.classList.add('disable-hover');
    }
    if (!isScrolling) {
      document.body.classList.remove('disable-hover');
    }
  };

  useKey('Delete', () => {
    if (!onDeleteKey) return;
    table.toggleAllRowsSelected(false);
    onDeleteKey(selectedItems);
  }, { event: 'keyup' }, [selectedItems]);

  return (
    <>
      <TableVirtuoso
        useWindowScroll
        components={{
          ScrollSeekPlaceholder: ({ index }: ScrollSeekPlaceholderProps) => {
            const row = table.getRowModel().rows[index];
            return (
              <TrackTablePlaceholder
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
          TableFoot,
          TableRow: ({ ...props }: ItemProps<Track>) => {
            const next = table.getRowModel().rows[props['data-index'] + 1];
            const prev = table.getRowModel().rows[props['data-index'] - 1];
            const row = table.getRowModel().rows[props['data-index']];
            return (
              <TrackTableRow
                compact={compact}
                data-row-id={row.getIsGrouped() ? null : row.original.id}
                data-selected={row.getIsSelected()}
                data-selected-above={prev?.getIsSelected() || false}
                data-selected-below={next?.getIsSelected() || false}
                isSorted={!isEmpty(sorting)}
                prevId={row.getIsGrouped() ? undefined : prev?.original.id}
                row={row}
                selectedItems={selectedItems}
                trackDropFn={trackDropFn}
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
        fixedFooterContent={() => (
          <TrackTableFooter
            isSorted={!isEmpty(sorting)}
            trackDropFn={trackDropFn}
          />
        )}
        fixedHeaderContent={() => (
          <>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header, index, array) => (
                  <th
                    className={styles[header.column.id]}
                    colSpan={header.colSpan}
                    data-is-sortable={header.column.getCanSort()}
                    key={header.id}
                    style={{
                      background: 'var(--mui-palette-background-paper)',
                      textAlign: (index === 0 && array[1]?.column.columnDef.header !== '')
                        ? 'left' : undefined,
                      width: (index === 0 && array[1]?.column.columnDef.header !== '') ? 26 : '',
                    }}
                    onClick={header.column.getToggleSortingHandler()}
                  >
                    {index === 0 && (
                      <TableSettings
                        isIndexOrThumbVisible={
                          table.getColumn('index')?.getIsVisible()
                          || table.getColumn('thumb')?.getIsVisible()
                          || false
                        }
                        setOpen={setOpen}
                      />
                    )}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext(),
                    )}
                    {['duration', 'userRating'].includes(header.id) && ({
                      asc: (<BsArrowUpShort viewBox="0 2 12 12" />),
                      desc: (<BsArrowDownShort viewBox="0 2 12 12" />),
                    }[header.column.getIsSorted() as string] ?? null)}
                    {!['duration', 'userRating'].includes(header.id) && ({
                      asc: (<BsArrowUpShort viewBox="0 0 12 12" />),
                      desc: (<BsArrowDownShort viewBox="0 0 12 12" />),
                    }[header.column.getIsSorted() as string] ?? null)}
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
        tracks={getTracks(selectedItems)}
        onClose={() => {
          toggleMenu(false);
          table.resetRowSelection();
        }}
        {...menuProps}
      >
        {!!additionalMenuOptions && additionalMenuOptions(selectedItems)}
      </TrackMenu>
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

TrackTable.defaultProps = {
  additionalMenuOptions: undefined,
  groupBy: undefined,
  trackDropFn: undefined,
  onDeleteKey: undefined,
};

const arePropsEqual = (prev: any, next: any) => isEqual(prev, next);

export default React.memo(TrackTable, arePropsEqual);
