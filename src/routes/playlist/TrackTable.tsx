import { ClickAwayListener, SvgIcon, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import {
  Row,
  SortingState,
  VisibilityState,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { atom, useAtomValue, useSetAtom } from 'jotai';
import { isEmpty, isEqual, range } from 'lodash';
import moment from 'moment';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { TrackTablePlaceholder, TrackTableRow, styles } from 'components/track-table';
import {
  ParentIndexCell,
  IndexCell,
  ThumbCell,
  TitleCell,
  RatingCell,
} from 'components/track-table/cells';
import { WIDTH_CALC } from 'constants/measures';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useNowPlaying } from 'queries/plex-queries';
import { playbackIsPlayingAtom } from 'root/Player';
import ColumnSettings from 'ui/sidebars/column-settings/ColumnSettings';
import Footer from './Footer';

const columnHelper = createColumnHelper<PlaylistItem>();

const iconSx = {
  color: 'text.secondary',
  height: 18,
  width: 18,
};

export const sortedPlaylistItemsAtom = atom<PlaylistItem[]>([]);

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
  additionalMenuOptions?(selectedItems: PlaylistItem[]): React.ReactNode,
  columnOptions: Partial<Record<keyof Track, boolean>>,
  isScrollingFn?: (isScrolling: boolean) => void,
  isViewCompact: boolean,
  library: Library,
  multiLineRating: boolean,
  playbackFn: (
    key?: string,
    shuffle?: boolean,
    sortedItems?: PlaylistItem[],
  ) => Promise<void>;
  rows: PlaylistItem[],
  scrollRef: HTMLDivElement | null,
  subtextOptions: SubtextOptions,
  trackDropFn?: (droppedItems: PlaylistItem[], prevId?: number) => Promise<void>,
  onDeleteKey?: (selectedItems: PlaylistItem[]) => void,
}> = ({
  additionalMenuOptions,
  columnOptions,
  isScrollingFn,
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
  const isPlaying = useAtomValue(playbackIsPlayingAtom);
  const setSortedPlaylistItems = useSetAtom(sortedPlaylistItemsAtom);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [compact, setCompact] = useState(isViewCompact);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });

  const [ratingOptions, setRatingOptions] = useState(multiLineRating);
  const [titleOptions, setTitleOptions] = useState<SubtextOptions>(subtextOptions);

  const { playSwitch } = usePlayback();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ ...columnOptions });
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const selectedItems = useMemo(() => Object.keys(rowSelection)
    .map((i) => rows[+i]), [rows, rowSelection]);

  const columns = useMemo(() => [
    columnHelper.accessor((row) => row.track.parentIndex, {
      id: 'parentIndex',
      cell: (info) => <ParentIndexCell info={info} />,
      header: '',
      enableSorting: false,
    }),
    columnHelper.accessor(() => 0, {
      id: 'index',
      cell: (info) => (
        <IndexCell
          index={info.row.index + 1}
          isPlaying={isPlaying}
          playing={nowPlaying?.track.id === info.row.original.track.id}
        />
      ),
      header: '',
      enableSorting: false,
    }),
    columnHelper.accessor((row) => row.track.thumb, {
      id: 'thumb',
      cell: (info) => (
        <ThumbCell
          isIndexVisible={info.table.getColumn('index')?.getIsVisible() || false}
          isPlaying={isPlaying}
          library={library}
          playing={nowPlaying?.track.id === info.row.original.track.id}
          track={info.row.original.track}
        />
      ),
      header: '',
      enableSorting: false,
    }),
    columnHelper.accessor((row) => row.track.title, {
      id: 'title',
      cell: (info) => (
        <TitleCell
          options={titleOptions}
          playing={nowPlaying?.track.id === info.row.original.track.id}
          track={info.row.original.track}
        />
      ),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Title
        </Typography>
      ),
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor((row) => row.track.grandparentTitle, {
      id: 'grandparentTitle',
      cell: (info) => {
        const { track } = info.row.original;
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
    columnHelper.accessor((row) => (row.track.originalTitle || row.track.grandparentTitle), {
      id: 'originalTitle',
      cell: (info) => {
        const { track } = info.row.original;
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
          Track Artist
        </Typography>
      ),
      sortingFn: 'alphanumeric',
    }),
    columnHelper.accessor((row) => row.track.parentTitle, {
      id: 'parentTitle',
      cell: (info) => (
        <NavLink
          className="link"
          style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
          to={`/albums/${info.row.original.track.parentTitle}`}
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
    columnHelper.accessor((row) => row.track.viewCount, {
      id: 'viewCount',
      cell: (info) => (
        <Link className="link" to={`/history/${info.row.original.track.id}`}>
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
    columnHelper.accessor((row) => row.track.lastViewedAt, {
      id: 'lastViewedAt',
      cell: (info) => (
        <Link className="link" to={`/history/${info.row.original.track.id}`}>
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
    columnHelper.accessor((row) => row.track.parentYear, {
      id: 'parentYear',
      cell: (info) => (info.getValue()),
      header: () => (
        <Typography color="text.secondary" lineHeight="24px" variant="overline">
          Year
        </Typography>
      ),
    }),
    columnHelper.accessor((row) => row.track.userRating, {
      id: 'userRating',
      cell: (info) => (
        <RatingCell
          library={library}
          showAdditionalRow={ratingOptions}
          track={info.row.original.track}
        />
      ),
      header: () => <SvgIcon sx={iconSx}><RiHeartLine /></SvgIcon>,
      sortUndefined: -1,
    }),
    columnHelper.accessor((row) => row.track.duration, {
      id: 'duration',
      cell: (info) => getFormattedTime(info.getValue()),
      header: () => <SvgIcon sx={iconSx}><RiTimeLine /></SvgIcon>,
    }),
  ], [getFormattedTime, isPlaying, library, nowPlaying?.track.id, ratingOptions, titleOptions]);

  const table = useReactTable({
    columns,
    data: rows,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    state: {
      columnVisibility,
      rowSelection,
      sorting,
    },
  });

  useEffect(() => {
    const sortedItems = table.getRowModel().rows
      .filter((_row) => !_row.getIsGrouped())
      .map(({ original }) => original);
    setSortedPlaylistItems(sortedItems);
  }, [rows, setSortedPlaylistItems, sorting, table]);

  const sortedItems = useMemo(() => {
    if (!isEmpty(sorting)) {
      return table.getRowModel().rows
        .filter((_row) => !_row.getIsGrouped())
        .map(({ original }) => original);
    }
    return undefined;
  }, [sorting, table]);

  const handleClick = useCallback((event: React.MouseEvent, row: Row<PlaylistItem>) => {
    if (event.button !== 0) return;
    if (event.detail === 2) {
      playbackFn(row.original.track.key, false, sortedItems);
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
  }, [playbackFn, rowSelection, selectedItems, sortedItems, table]);

  const handleContextMenu = useCallback((
    event: React.MouseEvent<Element>,
    row: Row<PlaylistItem>,
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

  const handleDragStart = useCallback((row: Row<PlaylistItem>) => {
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
          TableRow: ({ ...props }: ItemProps<PlaylistItem>) => {
            const next = table.getRowModel().rows[props['data-index'] + 1];
            const prev = table.getRowModel().rows[props['data-index'] - 1];
            const row = table.getRowModel().rows[props['data-index']];
            if (!row.original) {
              return (
                <TrackTablePlaceholder
                  columns={table.getVisibleLeafColumns()}
                  compact={compact}
                  isGrouped={false}
                  singleLineRating={!ratingOptions}
                  singleLineTitle={!titleOptions.showSubtext}
                />
              );
            }
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
          <Footer
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
        isScrolling={isScrollingFn || handleScrollState}
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
        playNow={() => playbackFn(selectedItems[0].track.key, false, sortedItems)}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedItems.map((selectedItem) => selectedItem.track)}
        onClose={() => {
          toggleMenu(false);
          table.resetRowSelection();
        }}
        {...menuProps}
      >
        {!!additionalMenuOptions && additionalMenuOptions(selectedItems)}
      </TrackMenu>
      <ColumnSettings
        compact={compact}
        ratingOptions={ratingOptions}
        setCompact={setCompact}
        setRatingOptions={setRatingOptions}
        setTitleOptions={setTitleOptions}
        table={table}
        tableKey="playlist"
        titleOptions={titleOptions}
      />
    </>
  );
};

TrackTable.defaultProps = {
  additionalMenuOptions: undefined,
  isScrollingFn: undefined,
  trackDropFn: undefined,
  onDeleteKey: undefined,
};

const arePropsEqual = (prev: any, next: any) => isEqual(prev, next);

export default React.memo(TrackTable, arePropsEqual);
