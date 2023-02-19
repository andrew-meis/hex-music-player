import { SvgIcon } from '@mui/material';
import { ControlledMenu, ControlledMenuProps, MenuDivider, MenuItem } from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { PlayQueueItem } from 'hex-plex';
import {
  BsPlayFill,
  MdClear,
  MdPlaylistAdd,
  RiAlbumFill,
  TbWaveSawTool,
  TiArrowForward,
  TiInfoLarge,
} from 'react-icons/all';
import { useNavigate } from 'react-router-dom';
import useDragActions from 'hooks/useDragActions';
import usePlayback from 'hooks/usePlayback';

interface QueueMenuProps extends ControlledMenuProps {
  currentId: number | undefined;
  items: PlayQueueItem[] | undefined;
  removeTracks: (itemsToRemove: PlayQueueItem[]) => Promise<void>;
  toggleMenu: (open?: boolean | undefined) => void;
}

const QueueMenu = ({
  currentId,
  items,
  removeTracks,
  toggleMenu,
  ...props
}: QueueMenuProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { moveMany, moveManyLast } = useDragActions();
  const { playQueueItem } = usePlayback();
  if (!currentId || !items) return null;
  const [item] = items;

  if (items.length > 1) {
    return (
      <ControlledMenu
        portal
        onClose={() => toggleMenu(false)}
        {...props}
      >
        <MenuItem
          onClick={() => moveMany(items.map((el) => el.id), currentId)}
        >
          <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>
          Move next
        </MenuItem>
        <MenuItem
          onClick={() => moveManyLast(items)}
        >
          <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>
          Move last
        </MenuItem>
        <MenuDivider />
        <MenuItem
          onClick={() => queryClient
            .setQueryData(['playlist-dialog-open'], items.map((el) => el.track))}
        >
          <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
          Add to playlist
        </MenuItem>
        <MenuDivider />
        <MenuItem
          className="error"
          onClick={() => removeTracks(items)}
        >
          <SvgIcon sx={{ mr: '8px' }}><MdClear /></SvgIcon>
          Remove
        </MenuItem>
      </ControlledMenu>
    );
  }

  return (
    <ControlledMenu
      portal
      onClose={() => toggleMenu(false)}
      {...props}
    >
      <MenuItem
        onClick={() => playQueueItem(item)}
      >
        <SvgIcon sx={{ mr: '8px' }}><BsPlayFill /></SvgIcon>
        Play from here
      </MenuItem>
      <MenuItem
        onClick={() => moveMany(items.map((el) => el.id), currentId)}
      >
        <SvgIcon sx={{ mr: '8px' }}><TiArrowForward /></SvgIcon>
        Move next
      </MenuItem>
      <MenuItem
        onClick={() => moveManyLast(items)}
      >
        <SvgIcon sx={{ mr: '8px', transform: 'scale(1,-1)' }}><TiArrowForward /></SvgIcon>
        Move last
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onClick={() => queryClient
          .setQueryData(['playlist-dialog-open'], items.map((el) => el.track))}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdPlaylistAdd /></SvgIcon>
        Add to playlist
      </MenuItem>
      <MenuItem
        onClick={() => navigate(`/tracks/${item.track.id}/similar`)}
      >
        <SvgIcon sx={{ mr: '8px' }}><TbWaveSawTool /></SvgIcon>
        Similar tracks
      </MenuItem>
      <MenuDivider />
      <MenuItem
        onClick={() => navigate(`/tracks/${item.track.id}`)}
      >
        <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
        Track information
      </MenuItem>
      <MenuItem onClick={() => navigate(`/albums/${item.track.parentId}`)}>
        <SvgIcon sx={{ mr: '8px' }}><RiAlbumFill /></SvgIcon>
        Go to album
      </MenuItem>
      <MenuDivider />
      <MenuItem
        className="error"
        onClick={() => removeTracks(items)}
      >
        <SvgIcon sx={{ mr: '8px' }}><MdClear /></SvgIcon>
        Remove
      </MenuItem>
    </ControlledMenu>
  );
};

export default QueueMenu;
