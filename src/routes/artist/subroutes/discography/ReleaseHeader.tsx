import { Avatar, Box, Typography } from '@mui/material';
import { useAtomValue } from 'jotai';
import moment from 'moment';
import React, { useEffect } from 'react';
import { useDrag } from 'react-dnd';
import { getEmptyImage } from 'react-dnd-html5-backend';
import { NavLink } from 'react-router-dom';
import { Track } from 'api/index';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { sortedTracksAtom } from 'components/track-table/TrackTable';
import { DragTypes } from 'types/enums';
import { AlbumWithSection } from 'types/interfaces';

const titleStyle = {
  overflow: 'hidden',
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  fontFamily: 'TT Commons, sans-serif',
  fontWeight: 600,
};

interface Map {
  [key: string]: string;
}

const typeMap: Map = {
  Albums: 'Album',
  'Singles & EPs': 'Single / EP',
  Soundtracks: 'Soundtrack',
  Compilations: 'Compilation',
  'Live Albums': 'Live Album',
  Demos: 'Demo',
  Remixes: 'Remix',
  'Appears On': 'Guest Appearance',
};

export const ReleaseHeader: React.FC<{
  album: AlbumWithSection,
  handlePlayNow: (key?: string, shuffle?: boolean, sortedItems?: Track[]) => Promise<void>,
  thumbSrc: string,
  trackKey: string,
  trackLength: number,
}> = ({
  album,
  handlePlayNow,
  thumbSrc,
  trackKey,
  trackLength,
}) => {
  const sortedTracks = useAtomValue(sortedTracksAtom);

  const [, drag, dragPreview] = useDrag(() => ({
    type: DragTypes.ALBUM,
    item: () => [album],
  }), [album]);

  useEffect(() => {
    dragPreview(getEmptyImage(), { captureDraggingState: true });
  }, [dragPreview, album]);

  const releaseDate = moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');

  const handlePlay = () => handlePlayNow(trackKey, false, sortedTracks);
  const handleShuffle = () => handlePlayNow(trackKey, true);

  return (
    <Box
      color="text.primary"
      display="flex"
      marginTop={4}
      ref={drag}
    >
      <Avatar
        src={thumbSrc}
        sx={{ width: 152, height: 152, mr: 2, my: 2 }}
        variant="rounded"
      />
      <Box alignItems="flex-end" display="flex" flexGrow={1} mb="10px">
        <Box alignItems="flex-start" display="flex" flexDirection="column" width="auto">
          <Box display="flex" height={18}>
            <Typography variant="subtitle2">
              {typeMap[album.section].toLowerCase()}
            </Typography>
          </Box>
          <Typography
            sx={titleStyle}
            variant="h4"
          >
            <NavLink
              className="link"
              to={`/albums/${album.id}`}
            >
              {album.title}
            </NavLink>
          </Typography>
          <Box alignItems="flex-end" display="flex" flexWrap="wrap" mt="4px">
            <Typography
              fontFamily="Rubik, sans-serif"
              sx={{
                overflow: 'hidden',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
              }}
              variant="subtitle2"
              width="fit-content"
            >
              {`${releaseDate} · ${trackLength} ${trackLength > 1 ? 'tracks' : 'track'}`}
            </Typography>
          </Box>
        </Box>
        <PlayShuffleButton handlePlay={handlePlay} handleShuffle={handleShuffle} />
      </Box>
    </Box>
  );
};

export default React.memo(ReleaseHeader);
