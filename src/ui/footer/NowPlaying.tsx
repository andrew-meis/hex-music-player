import { Avatar, Box, Typography } from '@mui/material';
import { useMenuState } from '@szhsin/react-menu';
import React, { useEffect, useState } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { NavLink } from 'react-router-dom';
import { PlayQueueItem } from 'api/index';
import { NowPlayingMenu } from 'components/menus';
import TrackRating from 'components/rating/TrackRating';
import Subtext from 'components/subtext/Subtext';
import usePlayback from 'hooks/usePlayback';
import { useLibrary } from 'queries/app-queries';
import { useNowPlaying } from 'queries/plex-queries';
import { DragTypes } from 'types/enums';

const typographyStyle = {
  whiteSpace: 'nowrap',
  textOverflow: 'ellipsis',
  overflow: 'hidden',
  lineHeight: 1.3,
};

const DraggableAvatar = ({ nowPlaying, onContextMenu, src }: {
  nowPlaying: PlayQueueItem;
  onContextMenu: (event: React.MouseEvent<HTMLDivElement>) => void;
  src: string;
}) => {
  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.TRACK,
    item: () => [nowPlaying?.track],
  }), [nowPlaying]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, nowPlaying]);

  return (
    <Avatar
      alt={nowPlaying.track.title}
      ref={drag}
      src={src}
      sx={{ width: 74, height: 74, marginX: '8px' }}
      variant="rounded"
      onContextMenu={onContextMenu}
    />
  );
};

const NowPlaying = () => {
  const library = useLibrary();
  const [anchorPoint, setAnchorPoint] = useState({ x: 0, y: 0 });
  const [menuProps, toggleMenu] = useMenuState({ unmountOnClose: true });
  const { data: nowPlaying } = useNowPlaying();
  const { playSwitch } = usePlayback();
  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.TRACK,
    item: () => [nowPlaying?.track],
  }), [nowPlaying]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, nowPlaying]);

  const thumbSrc = library.api.getAuthenticatedUrl(
    '/photo/:/transcode',
    {
      url: nowPlaying ? nowPlaying.track.thumb : '',
      width: 100,
      height: 100,
      minSize: 1,
      upscale: 1,
    },
  );

  const handleContextMenu = (event: React.MouseEvent<HTMLDivElement>) => {
    event.preventDefault();
    setAnchorPoint({ x: event.clientX, y: event.clientY });
    toggleMenu(true);
  };

  if (!nowPlaying) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          width: '100%',
          height: '100%',
          alignItems: 'center',
        }}
      >
        <DraggableAvatar
          nowPlaying={nowPlaying}
          src={thumbSrc}
          onContextMenu={handleContextMenu}
        />
        <Box
          sx={{
            display: 'table',
            height: 59,
            tableLayout: 'fixed',
            width: '100%',
          }}
        >
          <Typography
            ref={drag}
            sx={{
              ...typographyStyle,
              fontFamily: 'Rubik, sans-serif',
              fontSize: '0.95rem',
              fontWeight: 600,
              color: 'text.primary',
            }}
            onContextMenu={handleContextMenu}
          >
            <NavLink
              className="link"
              style={({ isActive }) => (isActive ? { pointerEvents: 'none' } : {})}
              to={`/tracks/${nowPlaying.track.id}`}
            >
              {nowPlaying.track.title}
            </NavLink>
          </Typography>
          <Typography sx={{ ...typographyStyle, fontSize: '0.875rem', color: 'text.secondary' }}>
            <Subtext showAlbum track={nowPlaying.track} />
          </Typography>
          <TrackRating
            id={nowPlaying.track.id}
            library={library}
            userRating={nowPlaying.track.userRating / 2 || 0}
          />
        </Box>
      </Box>
      <NowPlayingMenu
        anchorPoint={anchorPoint}
        playSwitch={playSwitch}
        toggleMenu={toggleMenu}
        tracks={[nowPlaying.track]}
        {...menuProps}
      />
    </>
  );
};

export default NowPlaying;
