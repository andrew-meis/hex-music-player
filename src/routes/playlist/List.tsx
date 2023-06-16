import { SvgIcon } from '@mui/material';
import { MenuDivider, MenuItem } from '@szhsin/react-menu';
import React, { useCallback, useEffect, useMemo } from 'react';
import { useDrop } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { MdDelete } from 'react-icons/md';
import { useKey } from 'react-use';
import { ListProps } from 'react-virtuoso';
import { PlaylistItem, PlayQueueItem, Track } from 'api/index';
import TrackMenu from 'components/menus/TrackMenu';
import { useRemoveFromPlaylist } from 'hooks/playlistHooks';
import useRowSelection from 'hooks/useRowSelection';
import useToast from 'hooks/useToast';
import useTrackDragDrop from 'hooks/useTrackDragDrop';
import useTrackMenu from 'hooks/useTrackMenu';
import ListBox from 'routes/virtuoso-components/ListBox';
import { DragTypes } from 'types/enums';
import { PlaylistContext } from './Playlist';

const List = React
  .forwardRef((
    { style, children, context }: ListProps & { context?: PlaylistContext | undefined },
    listRef: React.ForwardedRef<HTMLDivElement>,
  ) => {
    const removeFromPlaylist = useRemoveFromPlaylist();
    const toast = useToast();
    const {
      dropIndex, handleDrop, hoverIndex, items, playlist, queryClient, sort,
    } = context!;
    const { getAllSelections, clearRowSelection } = useRowSelection();
    const selections = useMemo(() => getAllSelections(), [getAllSelections]);

    const [, drop] = useDrop(() => ({
      accept: [
        DragTypes.PLAYLIST_ITEM,
        DragTypes.PLAYQUEUE_ITEM,
        DragTypes.TRACK,
      ],
      drop: (
        item: PlaylistItem[] | PlayQueueItem[] | Track[],
        monitor,
      ) => handleDrop(item, dropIndex.current, monitor.getItemType()),
    }), [items]);

    const { drag, dragPreview } = useTrackDragDrop({
      hoverIndex,
      items,
      selectedRows: selections,
      type: DragTypes.PLAYLIST_ITEM,
    });

    const dragDrop = useCallback((node: any) => {
      drag(drop(node));
    }, [drag, drop]);

    useEffect(() => {
      dragPreview(getEmptyImage(), { captureDraggingState: true });
    }, [dragPreview, selections]);

    const handleRemove = useCallback(() => {
      if (!items || selections.length === 0) {
        return;
      }
      if (playlist?.smart) {
        toast({ type: 'error', text: 'Cannot edit smart playlist' });
        return;
      }
      const selectedItems = selections.map((n) => items[n]);
      queryClient.setQueryData(['selected-rows'], []);
      selectedItems.forEach((item) => {
        removeFromPlaylist(item.playlistId, item.id);
      });
    }, [items, playlist, queryClient, removeFromPlaylist, selections, toast]);

    useKey('Delete', handleRemove, { event: 'keyup' }, [selections]);

    const {
      anchorPoint,
      handleContextMenu,
      menuProps,
      playSwitch,
      selectedTracks,
      toggleMenu,
    } = useTrackMenu({ tracks: context?.items.map((item) => item.track) || [] });

    return (
      <>
        <ListBox
          clearRowSelection={clearRowSelection}
          drag={playlist?.smart || sort.by !== 'index' ? drag : dragDrop}
          handleContextMenu={handleContextMenu}
          hoverIndex={hoverIndex}
          listRef={listRef}
          selectedRows={selections}
          style={style}
        >
          {children}
        </ListBox>
        <TrackMenu
          anchorPoint={anchorPoint}
          playSwitch={playSwitch}
          toggleMenu={toggleMenu}
          tracks={selectedTracks}
          {...menuProps}
        >
          {!playlist?.smart && (
          <>
            <MenuDivider />
            <MenuItem
              className="error"
              onClick={handleRemove}
            >
              <SvgIcon sx={{ mr: '8px' }}><MdDelete /></SvgIcon>
              Remove
            </MenuItem>
          </>
          )}
        </TrackMenu>
      </>
    );
  });

List.defaultProps = {
  context: undefined,
};

export default List;
