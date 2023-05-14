import { Avatar, Box, SvgIcon, Typography } from '@mui/material';
import moment from 'moment';
import React from 'react';
import { BiHash, RiHeartLine, RiTimeLine } from 'react-icons/all';
import { NavLink } from 'react-router-dom';
import PlayShuffleButton from 'components/play-shuffle-buttons/PlayShuffleButton';
import { useThumbnail } from 'hooks/plexHooks';
import useRowSelection from 'hooks/useRowSelection';
import { AlbumWithSection } from 'types/interfaces';
import { GroupRowProps } from './Discography';

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

interface GroupRowHeaderProps {
  album: AlbumWithSection;
  handlePlay: () => Promise<void>;
  handleShuffle: () => Promise<void>;
  thumbSrc: string;
  trackLength: number;
}

export const GroupRowHeader = (
  { album, handlePlay, handleShuffle, thumbSrc, trackLength }: GroupRowHeaderProps,
) => {
  const releaseDate = moment.utc(album.originallyAvailableAt).format('DD MMMM YYYY');
  return (
    <>
      <Avatar
        src={thumbSrc}
        sx={{ width: 152, height: 152, margin: '8px', ml: 0 }}
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
    </>
  );
};

const GroupRow = React.memo(({ album, context }: GroupRowProps) => {
  const { clearRowSelection } = useRowSelection();
  const {
    groupCounts, groups, playAlbum,
  } = context!;
  const [thumbSrc] = useThumbnail(album.thumb || 'none', 300);
  const groupIndex = groups.findIndex((obj) => obj.id === album.id);
  const trackLength = groupCounts[groupIndex];

  const handlePlay = () => playAlbum(album);
  const handleShuffle = () => playAlbum(album, true);

  return (
    <>
      <Box
        alignItems="flex-end"
        bgcolor="background.paper"
        borderBottom="1px solid transparent"
        color="text.primary"
        display="flex"
        height={168}
        onClick={clearRowSelection}
        onMouseEnter={() => {
          context.hoverIndex.current = null;
        }}
      >
        <GroupRowHeader
          album={album}
          handlePlay={handlePlay}
          handleShuffle={handleShuffle}
          thumbSrc={thumbSrc}
          trackLength={trackLength}
        />
      </Box>
      <Box
        alignItems="flex-start"
        bgcolor="background.paper"
        borderBottom="1px solid"
        borderColor="border.main"
        color="text.secondary"
        display="flex"
        height={30}
        width="100%"
      >
        <Box maxWidth="10px" width="10px" />
        <Box display="flex" flexShrink={0} justifyContent="center" width="40px">
          <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
            <BiHash />
          </SvgIcon>
        </Box>
        <Box sx={{ width: '56px' }} />
        <Box sx={{
          width: '50%', flexGrow: 1, display: 'flex', justifyContent: 'flex-end',
        }}
        >
          <span />
        </Box>
        <Box display="flex" flexShrink={0} justifyContent="flex-end" mx="5px" width="80px">
          <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
            <RiHeartLine />
          </SvgIcon>
        </Box>
        <Box sx={{
          width: '50px', marginLeft: 'auto', textAlign: 'right', flexShrink: 0,
        }}
        >
          <SvgIcon sx={{ height: '18px', width: '18px', py: '5px' }}>
            <RiTimeLine />
          </SvgIcon>
        </Box>
        <Box maxWidth="10px" width="10px" />
      </Box>
    </>
  );
});

export default GroupRow;
