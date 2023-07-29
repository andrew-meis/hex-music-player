import { ClickAwayListener } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import {
  GroupingState,
  Row,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getExpandedRowModel,
  getGroupedRowModel,
  getSortedRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useAtomValue, useSetAtom } from 'jotai';
import { isEmpty, isEqual, range } from 'lodash';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { BsArrowDownShort, BsArrowUpShort } from 'react-icons/bs';
import {
  ItemProps,
  ScrollSeekPlaceholderProps,
  TableProps,
  TableVirtuoso,
} from 'react-virtuoso';
import { Library, Track } from 'api/index';
import { TrackMenu } from 'components/menus';
import { SubtextOptions } from 'components/subtext/Subtext';
import { TrackTableRow, styles } from 'components/track-table';
import { useDefaultColumns } from 'components/track-table/columns';
import { sortedTracksAtom } from 'components/track-table/TrackTable';
import useFormattedTime from 'hooks/useFormattedTime';
import usePlayback from 'hooks/usePlayback';
import { useNowPlaying } from 'queries/plex-queries';
import { playbackIsPlayingAtom } from 'root/Player';
import { AlbumWithSection } from 'types/interfaces';
import ColumnSettings from 'ui/sidebars/column-settings/ColumnSettings';
import { headerTextAtom } from './Header';
import ReleaseHeader from './ReleaseHeader';
import TrackTablePlaceholder from './TrackTablePlaceholder';

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
  columnOptions: Partial<Record<keyof Track, boolean>>,
  groupBy: (keyof Track)[],
  isViewCompact: boolean,
  library: Library,
  multiLineRating: boolean,
  playbackFn: (
    key?: string,
    shuffle?: boolean,
    sortedItems?: Track[],
  ) => Promise<void>;
  releases: AlbumWithSection[]
  rows: Track[],
  scrollRef: HTMLDivElement | null,
  subtextOptions: SubtextOptions,
}> = ({
  columnOptions,
  groupBy,
  isViewCompact,
  library,
  multiLineRating,
  playbackFn,
  releases,
  rows,
  scrollRef,
  subtextOptions,
}) => {
  const isPlaying = useAtomValue(playbackIsPlayingAtom);
  const setHeaderText = useSetAtom(headerTextAtom);
  const setSortedTracks = useSetAtom(sortedTracksAtom);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [compact, setCompact] = useState(isViewCompact);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });

  const [ratingOptions, setRatingOptions] = useState(multiLineRating);
  const [titleOptions, setTitleOptions] = useState<SubtextOptions>(subtextOptions);

  const { playSwitch } = usePlayback();
  const { data: nowPlaying } = useNowPlaying();
  const { getFormattedTime } = useFormattedTime();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ ...columnOptions });
  const [grouping, setGrouping] = useState<GroupingState>(groupBy || []);
  const [rowSelection, setRowSelection] = useState({});
  const [sorting, setSorting] = useState<SortingState>([]);

  const selectedItems = useMemo(() => Object.keys(rowSelection)
    .map((i) => rows[+i]), [rows, rowSelection]);

  const columns = useDefaultColumns({
    additionalColumns: [{
      id: 'parentId',
      accessorFn: (track) => track.parentId,
      cell: () => '',
      header: () => '',
    },
    {
      id: 'parentRatingKey',
      accessorFn: (track) => track.parentRatingKey,
      cell: () => '',
      header: () => '',
    }],
    getFormattedTime,
    isPlaying,
    library,
    nowPlaying,
    ratingOptions,
    titleOptions,
    useTrackNumber: true,
  });

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
      setGrouping(groupBy || []);
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

  useEffect(() => {
    const sortedItems = table.getRowModel().rows
      .filter((_row) => !_row.getIsGrouped())
      .map(({ original }) => original);
    setSortedTracks(sortedItems);
  }, [setSortedTracks, sorting, table]);

  const sortedItems = useMemo(() => {
    if (!isEmpty(sorting)) {
      return table.getRowModel().rows
        .filter((_row) => !_row.getIsGrouped())
        .map(({ original }) => original);
    }
    return undefined;
  }, [sorting, table]);

  const handleClick = useCallback((event: React.MouseEvent, row: Row<Track>) => {
    if (event.button !== 0) return;
    if (event.detail === 2) {
      playbackFn(row.original.key, false, sortedItems);
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
    row: Row<Track>,
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

  const handleDragStart = useCallback((row: Row<Track>) => {
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
                groupingColumnId={row.groupingColumnId || ''}
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
                  width: '100%',
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
            if (row.groupingColumnId === 'parentId') {
              const release = releases.find((item) => row.groupingValue === item.id.toString());
              return (
                <tr {...props} style={{ height: 216 }}>
                  <th colSpan={100} style={{ border: 'none', padding: 0 }}>
                    {!!release && (
                      <ReleaseHeader
                        album={release}
                        handlePlayNow={playbackFn}
                        thumbSrc={library.api.getAuthenticatedUrl(
                          '/photo/:/transcode',
                          {
                            url: release.thumb, width: 300, height: 300, minSize: 1, upscale: 1,
                          },
                        )}
                        trackKey={row.getLeafRows()[0].original.key}
                        trackLength={rows.filter((el) => el.parentId === release.id).length || 0}
                      />
                    )}
                  </th>
                </tr>
              );
            }
            if (row.groupingColumnId === 'parentRatingKey') {
              return (
                <>
                  {table.getHeaderGroups().map((headerGroup) => (
                    <tr key={headerGroup.id} {...props}>
                      {headerGroup.headers.map((header) => (
                        <th
                          className={styles[header.column.id]}
                          colSpan={header.colSpan}
                          data-is-sortable={header.column.getCanSort()}
                          key={header.id}
                          style={{
                            background: 'var(--mui-palette-background-paper)',
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
              );
            }
            if (row.groupingColumnId === 'parentIndex') {
              const cell = row.getVisibleCells()
                .find(({ column }) => column.id === 'parentIndex')!;
              return (
                <tr {...props} style={{ height: compact ? 40 : 56 }}>
                  <td className={styles[cell.column.id]} colSpan={100} key={cell.id}>
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext(),
                    )}
                  </td>
                </tr>
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
                row={row}
                selectedItems={selectedItems}
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
          <tr>
            <td
              colSpan={100}
              style={{
                borderTop: '1px solid var(--mui-palette-border-main)',
                height: 30,
              }}
            />
          </tr>
        )}
        fixedHeaderContent={() => (
          <>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} style={{ visibility: 'collapse' }}>
                {headerGroup.headers.map((header) => (
                  <th
                    className={styles[header.column.id]}
                    colSpan={header.colSpan}
                    data-is-sortable={header.column.getCanSort()}
                    key={header.id}
                    style={{
                      background: 'var(--mui-palette-background-paper)',
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
        isScrolling={handleScrollState}
        itemContent={(index) => {
          const row = table.getRowModel().rows[index];
          if (row.getIsGrouped()) {
            return '';
          }
          return row.getVisibleCells()
            .filter(({ column }) => !['options', 'parentId', 'parentIndex', 'parentRatingKey']
              .includes(column.id))
            .map((cell, cellIndex) => (
              <td
                className={styles[cell.column.id]}
                colSpan={cellIndex === 0 ? 4 : 1}
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
        rangeChanged={(newRange) => {
          const { startIndex } = newRange;
          if (startIndex === 0) {
            setHeaderText('');
            return;
          }
          const title = table.getRowModel().rows[startIndex].original.parentTitle;
          setHeaderText(title);
        }}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 500,
          exit: (velocity) => Math.abs(velocity) < 100,
        }}
        totalCount={table.getRowModel().rows.length}
      />
      <TrackMenu
        anchorPoint={anchorPoint}
        playNow={() => playbackFn(selectedItems[0].key, false, sortedItems)}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedItems}
        onClose={() => {
          toggleMenu(false);
          table.resetRowSelection();
        }}
        {...menuProps}
      />
      <ColumnSettings
        useTrackNumber
        compact={compact}
        ratingOptions={ratingOptions}
        setCompact={setCompact}
        setRatingOptions={setRatingOptions}
        setTitleOptions={setTitleOptions}
        table={table}
        tableKey="album"
        titleOptions={titleOptions}
      />
    </>
  );
};

const arePropsEqual = (prev: any, next: any) => isEqual(prev, next);

export default React.memo(TrackTable, arePropsEqual);
