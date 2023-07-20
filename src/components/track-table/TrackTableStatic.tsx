import { ClickAwayListener } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import {
  ColumnDef,
  Row,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from '@tanstack/react-table';
import { useAtomValue } from 'jotai';
import { isEmpty, isEqual, range } from 'lodash';
import React, { useCallback, useMemo, useState } from 'react';
import { Library, Track } from 'api/index';
import { TrackMenu } from 'components/menus';
import { SubtextOptions } from 'components/subtext/Subtext';
import usePlayback from 'hooks/usePlayback';
import { useNowPlaying } from 'queries/plex-queries';
import { playbackIsPlayingAtom } from 'root/Player';
import { ColumnVisibilityDialog, useDefaultColumns } from './columns';
import styles from './TrackTable.module.scss';
import TrackTableRowStatic from './TrackTableRowStatic';

const TrackTableStatic: React.FC<{
  additionalColumns?: ColumnDef<Track, any>[],
  columnOptions: Partial<Record<keyof Track, boolean>>,
  isViewCompact: boolean,
  library: Library,
  multiLineRating: boolean,
  open: boolean,
  playbackFn: (
    key?: string,
    shuffle?: boolean,
  ) => Promise<void>;
  rows: Track[],
  setOpen: React.Dispatch<React.SetStateAction<boolean>>,
  subtextOptions: SubtextOptions,
  viewKey: string,
}> = ({
  additionalColumns,
  columnOptions,
  isViewCompact,
  library,
  multiLineRating,
  open,
  playbackFn,
  rows,
  setOpen,
  subtextOptions,
  viewKey,
}) => {
  const isPlaying = useAtomValue(playbackIsPlayingAtom);

  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [compact, setCompact] = useState(isViewCompact);
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });

  const [ratingOptions, setRatingOptions] = useState(multiLineRating);
  const [titleOptions, setTitleOptions] = useState<SubtextOptions>(subtextOptions);

  const { playSwitch } = usePlayback();
  const { data: nowPlaying } = useNowPlaying();

  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({ ...columnOptions });
  const [rowSelection, setRowSelection] = useState({});

  const selectedItems = useMemo(() => Object.keys(rowSelection)
    .map((i) => rows[+i]), [rows, rowSelection]);

  const columns = useDefaultColumns({
    additionalColumns: additionalColumns || [],
    isPlaying,
    library,
    nowPlaying,
    ratingOptions,
    titleOptions,
  });

  const table = useReactTable({
    columns,
    data: rows,
    enableRowSelection: true,
    getCoreRowModel: getCoreRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      columnVisibility,
      rowSelection,
    },
  });

  const handleClick = useCallback((event: React.MouseEvent, row: Row<Track>) => {
    if (event.button !== 0) return;
    if (event.detail === 2) {
      playbackFn(row.original.key, false);
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
  }, [playbackFn, rowSelection, selectedItems, table]);

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

  const handleDragEnd = useCallback(() => {
    const nodes = document.querySelectorAll('tr.track-table-row');
    nodes.forEach((node) => {
      node.removeAttribute('data-non-dragged');
      node.removeAttribute('data-dragged');
    });
    table.resetRowSelection(false);
  }, [table]);

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

  return (
    <>
      <ClickAwayListener onClickAway={() => table.resetRowSelection()}>
        <table
          className="track-table"
          key={`${compact}`}
          style={{
            borderSpacing: '0px',
            color: 'white',
            margin: 'auto',
            overflowAnchor: 'none',
            width: '100%',
            tableLayout: 'fixed',
          }}
        >
          <tbody>
            {table.getRowModel().rows.map((row) => {
              const next = table.getRowModel().rows[row.index + 1];
              const prev = table.getRowModel().rows[row.index - 1];
              return (
                <TrackTableRowStatic
                  compact={compact}
                  key={row.id}
                  next={next}
                  prev={prev}
                  row={row}
                  selectedItems={selectedItems}
                  onClick={(e) => handleClick(e, row)}
                  onContextMenu={(e: React.MouseEvent) => handleContextMenu(e, row)}
                  onDragEnd={handleDragEnd}
                  onDragStart={() => handleDragStart(row)}
                >
                  {row.getVisibleCells()
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
                    ))}
                </TrackTableRowStatic>
              );
            })}
          </tbody>
        </table>
      </ClickAwayListener>
      <TrackMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={selectedItems}
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
        viewKey={viewKey}
      />
    </>
  );
};

TrackTableStatic.defaultProps = {
  additionalColumns: [],
};

const arePropsEqual = (prev: any, next: any) => isEqual(prev, next);

export default React.memo(TrackTableStatic, arePropsEqual);
