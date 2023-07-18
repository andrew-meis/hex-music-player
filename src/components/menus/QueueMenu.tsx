import { SvgIcon } from '@mui/material';
import {
  ControlledMenu,
  ControlledMenuProps,
  MenuDivider,
  MenuItem,
} from '@szhsin/react-menu';
import { useQueryClient } from '@tanstack/react-query';
import { BsPlayFill } from 'react-icons/bs';
import { MdPlaylistAdd, MdClear } from 'react-icons/md';
import { TbWaveSawTool } from 'react-icons/tb';
import { TiArrowForward, TiInfoLarge } from 'react-icons/ti';
import { NavLink, useNavigate } from 'react-router-dom';
import { Artist, PlayQueueItem, Track } from 'api/index';
import useArtistMatch from 'hooks/useArtistMatch';
import useDragActions from 'hooks/useDragActions';
import usePlayback from 'hooks/usePlayback';
import AlbumMenuItem from './menu-items/AlbumMenuItem';
import ArtistMenuItem from './menu-items/ArtistMenuItem';

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
  const artists = useArtistMatch({
    name: items && items.length === 1
      ? items[0].track.originalTitle || items[0].track.grandparentTitle
      : '',
  });
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { moveMany, moveManyLast } = useDragActions();
  const { playQueueItem } = usePlayback();
  if (!currentId || !items) return null;
  const [item] = items;
  if (!item) return null;

  const handleArtistNavigate = (artist: Artist) => {
    const state = { guid: artist.guid, title: artist.title };
    navigate(`/artists/${artist.id}`, { state });
  };

  const handleTrackNavigate = (track: Track) => {
    const state = { guid: track.grandparentId, title: track.grandparentTitle };
    navigate(`/artists/${track.grandparentId}`, { state });
  };

  if (items.length > 1) {
    return (
      <ControlledMenu
        portal
        boundingBoxPadding="10"
        submenuCloseDelay={0}
        submenuOpenDelay={0}
        onClose={() => {
          document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
          toggleMenu(false);
        }}
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
      boundingBoxPadding="10"
      submenuCloseDelay={0}
      submenuOpenDelay={0}
      onClose={() => {
        document.querySelector('.titlebar')?.classList.remove('titlebar-nodrag');
        toggleMenu(false);
      }}
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
      <NavLink className="nav-link" to={`/tracks/${item.track.id}`}>
        {({ isActive }) => (
          <>
            {!isActive && (
              <MenuItem>
                <SvgIcon sx={{ mr: '8px' }}><TiInfoLarge /></SvgIcon>
                Track details
              </MenuItem>
            )}
          </>
        )}
      </NavLink>
      {
        item.track.grandparentTitle === 'Various Artists'
        && artists.length === 1
        && (
          <>
            <MenuDivider />
            {artists.map((artist) => (
              <ArtistMenuItem
                key={artist.id}
                thumb={artist.thumb}
                title={artist.title}
                onClick={() => handleArtistNavigate(artist)}
              />
            ))}
          </>
        )
      }
      {
        (artists.length === 0 || artists.length === 1)
        && item.track.grandparentTitle !== 'Various Artists'
        && (
          <>
            <MenuDivider />
            <ArtistMenuItem
              thumb={item.track.grandparentThumb}
              title={item.track.grandparentTitle}
              onClick={() => handleTrackNavigate(item.track)}
            />
          </>
        )
      }
      {
        artists.length > 1
        && (
          <>
            <MenuDivider />
            {artists.map((artist) => (
              <ArtistMenuItem
                key={artist.id}
                thumb={artist.thumb}
                title={artist.title}
                onClick={() => handleArtistNavigate(artist)}
              />
            ))}
          </>
        )
      }
      <NavLink className="nav-link" to={`/albums/${item.track.parentId}`}>
        {({ isActive }) => (
          <>
            {!isActive && (
              <>
                <MenuDivider />
                <AlbumMenuItem
                  thumb={item.track.parentThumb}
                  title={item.track.parentTitle}
                />
              </>
            )}
          </>
        )}
      </NavLink>
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
